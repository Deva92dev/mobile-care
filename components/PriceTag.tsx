import { formatPrice } from "@/lib/format";

interface PriceTagProps {
  price: number;
  className?: string;
}

const PriceTag = ({ price, className }: PriceTagProps) => {
  // className inside '${}' is optional so that you can style it from outside
  return <span className={`badge ${className}`}>{formatPrice(price)}</span>;
};

export default PriceTag;
