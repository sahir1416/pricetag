import Product from "@/lib/models/product.model";
import { connectToDB } from "@/lib/mongoose"
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        connectToDB();
        const products = await Product.find({});

        if(!products) throw new Error("No Product Found")
        // 1. Scrape Latest  Product Details & Update DB  
    
        const updatedProduct = await Promise.all(
            products.map(async (currentProduct) =>{
                const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

                if(!scrapedProduct) throw new Error("No Product Found");

                const updatedPriceHistory = [
                    ...currentProduct.priceHistory,
                    { price: scrapedProduct.currentPrice }
                 ]
        
                const product = {
                    ...scrapedProduct,
                    priceHistory: updatedPriceHistory,
                    lowestPrice: getLowestPrice(updatedPriceHistory),
                    highestPrice: getHighestPrice(updatedPriceHistory),
                    averagePrice: getAveragePrice(updatedPriceHistory),
                 }
               
        
               const updateProduct = await Product.findOneAndUpdate(
                 { url: scrapedProduct.url },
                 product,
                 
               );

               // 2. CHECK EACH PRODUCT'S STATUS & SEND EMAIL ACCORDINGLY
               const emailNotifType = getEmailNotifType(scrapedProduct, currentProduct) 

               if(emailNotifType && updateProduct.users.length > 0){
                const productInfo = {
                    title: updateProduct.title,
                    url: updateProduct.url,
                }

                const emailContent = await generateEmailBody(productInfo, emailNotifType);

                const userEmails = updateProduct.users.map((user: any) => user.email)

                await sendEmail(emailContent, userEmails)
               }
               
               return updatedProduct
            }) 
        )

        return NextResponse.json({
            message: 'Ok', data: updatedProduct
        })
    }   catch (error) {
        
        throw new Error(`Error in GET: ${error}`)
    }
    
}