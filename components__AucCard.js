import ProductCard from '@/components/ProductCard';
export default function AucCard({ a }) {
  return <ProductCard a={{ ...a, kind: 'auction', bids: a.n, n: 0 }} />;
}
