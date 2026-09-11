import { Link } from 'react-router-dom'

export function getShopMapUrl(shop) {
  const hasCoordinates = Number.isFinite(shop.location?.latitude) && Number.isFinite(shop.location?.longitude)
  return shop.location?.googleMapsUrl || (hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${shop.location.latitude},${shop.location.longitude}`
    : null)
}

export default function ShopContactCard({ shop, mapUrl = getShopMapUrl(shop) }) {
  return <aside className="shop-contact-card">
    <h2>راه‌های ارتباطی</h2>
    {shop.phone ? <a className="btn btn-primary" href={`tel:${shop.phone}`}>تماس با تعمیرگاه</a> : <p>شماره تماس این تعمیرگاه ثبت نشده است.</p>}
    {shop.address ? <p><strong>نشانی:</strong> {shop.address}</p> : null}
    {mapUrl ? <a className="btn btn-secondary" href={mapUrl} target="_blank" rel="noreferrer">مشاهده روی نقشه</a> : <p>موقعیت نقشه ثبت نشده است.</p>}
    {shop.reservationEnabled ? <Link className="btn btn-secondary" to={`/shops/${shop.id}/reserve`}>درخواست رزرو</Link> : null}
  </aside>
}
