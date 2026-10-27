'use client'

import Link from 'next/link'
import highlights from '../../data/home-highlights.json'
import { phoneHref } from '@/lib/store-defaults'
import { useStoreInfo } from '@/lib/use-store'
import { presentHomeCategories, useHomeVisibility } from '@/lib/home-visibility'

export default function Footer() {
  const store = useStoreInfo()
  const visibility = useHomeVisibility()
  const categories = presentHomeCategories(visibility, highlights.categories)
  return (
    <footer className="bg-dark" id="tempaltemo_footer">
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-6 pt-5">
            <h2 className="h2 text-success border-bottom pb-3 border-light logo">{store.storeName}</h2>
            <ul className="list-unstyled text-light footer-link-list">
              <li className="d-inline-block me-4">
                <a className="text-light" href={phoneHref(store.phone)}>{store.phone}</a>
              </li>
              <li className="d-inline-block me-4">
                <a className="text-light" href={`mailto:${store.email}`}>{store.email}</a>
              </li>
              <li className="d-inline-block me-4">
                <a className="text-light" href="/">Trang Chủ</a>
              </li>
              <li className="d-inline-block me-4">
                <a className="text-light" href="/about">Giới Thiệu</a>
              </li>
              <li className="d-inline-block me-4">
                <a className="text-light" href="/shop">Sản Phẩm</a>
              </li>
              <li className="d-inline-block me-4">
                <a className="text-light" href="/contact">Liên Hệ</a>
              </li>
            </ul>
          </div>

          <div className="col-12 col-md-6 pt-5">
            <details className="footer-products">
              <summary>
                <span>Sản Phẩm</span>
                <i className="fas fa-chevron-down" aria-hidden="true" />
              </summary>
              <ul className="list-unstyled text-light footer-link-list">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link className="text-decoration-none text-light" href={`/shop?category=${category.slug}`}>
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </div>

        <div className="row text-light mb-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <h5 className="mb-3 footer-heading">Giờ Làm Việc</h5>
            <ul className="list-unstyled">
              <li className="">{store.hoursWeekday}</li>
              <li className="">{store.hoursSaturday}</li>
              <li className="">{store.hoursSunday}</li>
            </ul>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <h5 className="mb-3 footer-heading">Thanh Toán</h5>
            <ul className="list-unstyled">
              <li className="">Tiền mặt</li>
              <li className="">Chuyển khoản</li>
              <li className="">Ví điện tử</li>
              <li className="">Thẻ tín dụng</li>
            </ul>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <h5 className="mb-3 footer-heading">Dịch Vụ</h5>
            <ul className="list-unstyled">
              <li className="">Tư vấn phong thủy</li>
              <li className="">Chế tác theo yêu cầu</li>
              <li className="">Giao hàng toàn quốc</li>
              <li className="">Bảo hành sản phẩm</li>
            </ul>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <h5 className="mb-3 footer-heading">Danh Mục</h5>
            <ul className="list-unstyled">
              {categories.slice(0, 6).map((category) => (
                <li key={category.slug}>
                  <Link className="text-decoration-none text-light" href={`/shop?category=${category.slug}`}>
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="w-100 bg-black py-3">
        <div className="container">
          <div className="row pt-2">
            <div className="col-12">
              <div className="row">
                <div className="col-12 col-md-6">
                  <p className="text-left text-light">
                    Copyright &copy; 2024 <a href="#" className="text-success">{store.storeName}</a> | 
                    Đá Cảnh & Mỹ Nghệ Chất Lượng Cao
                  </p>
                </div>
                <div className="col-12 col-md-6">
                  <p className="text-end text-light">
                    <a className="text-decoration-none text-light" href="https://web.facebook.com/an.lac.stone/" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f fa-sm fa-fw me-2"></i></a>
                    <a className="text-decoration-none text-light" href="https://web.facebook.com/an.lac.stone/" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram fa-sm fa-fw me-2"></i></a>
                    <a className="text-decoration-none text-light" href="https://web.facebook.com/an.lac.stone/" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter fa-sm fa-fw me-2"></i></a>
                    <a className="text-decoration-none text-light" href="https://web.facebook.com/an.lac.stone/" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube fa-sm fa-fw"></i></a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 