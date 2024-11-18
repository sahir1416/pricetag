import Image from "next/image";

interface Props {
    title: string;
    iconSrc: string;
    value: string;
    //borderColor: string;
}

const PriceInfoCard = ({title, iconSrc, value, /*borderColor*/}: Props) => {
  return (
    //<div className={`price-info_card border-l-[${borderColor}]`}>
    <div className={`price-info_card`}>
      <p className="text-base text-black-100">{title}</p>

      <div>
        <Image
          src={iconSrc}
          alt = {title}
          width={24}
          height={24}
        />

        <p className="text-xl font-bold text-secondary">{value}</p>
      </div>
    </div>
  )
}

export default PriceInfoCard