import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Giới Thiệu - An Lạc Stone',
  description:
    'Câu chuyện An Lạc Stone: hành trình đam mê đá cảnh và mỹ nghệ, từ đá tự nhiên đến sản phẩm chế tác tinh xảo.',
}

const features = [
  {
    id: 'natural',
    title: 'Đá tự nhiên',
    text: 'Mỗi đường vân là dấu ấn thời gian. Đá thiên nhiên kể câu chuyện trường tồn và kết nối với đất mẹ.',
    href: '/shop',
    image: '/images/clean/about/natural.jpg',
    imageAlt: 'Đá tự nhiên An Lạc Stone',
    cta: 'Xem đá cảnh',
  },
  {
    id: 'craft',
    title: 'Sản phẩm mỹ nghệ',
    text: 'Từng món mỹ nghệ giữ hồn làng nghề: gần gũi, giản dị và tinh tế trong từng đường chế tác.',
    href: '/shop',
    image: '/images/clean/about/craft.jpg',
    imageAlt: 'Sản phẩm mỹ nghệ đá',
    cta: 'Xem mỹ nghệ',
  },
  {
    id: 'service',
    title: 'Dịch vụ',
    text: 'Từ khai thác an toàn đến chế tác tại xưởng và giao hàng đúng hẹn, chúng tôi kiểm soát từng bước.',
    href: '/contact',
    image: '/images/clean/about/service.jpg',
    imageAlt: 'Dịch vụ chế tác đá',
    cta: 'Liên hệ tư vấn',
  },
  {
    id: 'showroom',
    title: 'Showroom & Kho đá',
    text: 'Chạm tay vào từng khối đá, cảm nhận chất liệu và chọn tác phẩm phù hợp không gian sống của bạn.',
    href: '/contact',
    image: '/images/clean/about/showroom.jpg',
    imageAlt: 'Showroom và kho đá',
    cta: 'Đặt lịch xem',
  },
]

export default function About() {
  return (
    <div className="about-taste">
      <Header />

      <main>
        <section className="about-taste__hero">
          <div className="about-taste__hero-media" aria-hidden="true">
            <Image
              src="/images/clean/about/hero.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="about-taste__hero-img"
            />
            <div className="about-taste__hero-veil" />
          </div>
          <div className="container">
            <Reveal className="about-taste__hero-copy">
              <p className="taste-kicker">An Lạc Stone</p>
              <h1 className="about-taste__hero-title">
                Câu chuyện
                <br />
                về đá
              </h1>
              <p className="about-taste__hero-lead">
                Từ đam mê đá cảnh đến những tác phẩm mỹ nghệ cho không gian sống.
              </p>
              <div className="about-taste__hero-actions">
                <a href="#cau-chuyen" className="btn btn-success taste-btn">
                  Đọc câu chuyện
                </a>
                <Link href="/shop" className="btn btn-outline-success taste-btn taste-btn--ghost">
                  Xem cửa hàng
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="cau-chuyen" className="about-taste__story">
          <div className="container">
            <div className="about-taste__story-grid">
              <Reveal className="about-taste__story-copy">
                <h2 className="about-taste__section-title">
                  Bắt đầu từ
                  <br />
                  niềm đam mê
                </h2>
                <p className="about-taste__section-text">
                  Xuất phát từ con số 0 giữa lòng Đà Nẵng, An Lạc Stone rong ruổi núi non và sông
                  suối để tìm những khối đá mang dấu ấn tự nhiên hiếm có.
                </p>
                <p className="about-taste__section-text">
                  Không bán món đồ đơn thuần: chúng tôi mang vẻ đẹp đá tự nhiên vào không gian sống
                  qua bàn tay nghệ nhân.
                </p>
                <Link href="/shop" className="about-taste__text-link">
                  Khám phá sản phẩm
                  <i className="fas fa-arrow-right" aria-hidden="true" />
                </Link>
              </Reveal>

              <Reveal delayMs={90} className="about-taste__story-visual">
                <div className="about-taste__story-frame">
                  <Image
                    src="/images/clean/about/story-photo.jpg"
                    alt="Khối đá tự nhiên chọn lọc"
                    fill
                    sizes="(max-width: 991px) 100vw, 46vw"
                    className="about-taste__story-img"
                  />
                </div>
                <div className="about-taste__story-note">
                  <Image
                    src="/images/clean/about/story-bg.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 991px) 40vw, 18vw"
                    className="about-taste__story-note-img"
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="about-taste__features">
          <div className="container">
            <Reveal>
              <div className="about-taste__features-head">
                <h2 className="about-taste__section-title">Chúng tôi mang đến</h2>
                <p className="about-taste__section-text">
                  Đá tự nhiên, mỹ nghệ, dịch vụ chế tác và không gian trải nghiệm thực tế.
                </p>
              </div>
            </Reveal>

            <div className="about-taste__bento">
              {features.map((feature, index) => (
                <Reveal
                  key={feature.id}
                  delayMs={index * 50}
                  className={`about-taste__bento-cell${index === 0 ? ' is-hero' : ''}`}
                >
                  <article id={feature.id} className="about-taste__bento-card">
                    <div className="about-taste__bento-media">
                      <Image
                        src={feature.image}
                        alt={feature.imageAlt}
                        fill
                        sizes={
                          index === 0
                            ? '(max-width: 991px) 100vw, 50vw'
                            : '(max-width: 991px) 100vw, 25vw'
                        }
                        className="about-taste__bento-img"
                      />
                      <div className="about-taste__bento-scrim" />
                    </div>
                    <div className="about-taste__bento-body">
                      <h3 className="about-taste__bento-title">{feature.title}</h3>
                      <p className="about-taste__bento-text">{feature.text}</p>
                      <Link href={feature.href} className="about-taste__bento-cta">
                        {feature.cta}
                        <i className="fas fa-arrow-right" aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="about-taste__cta">
          <div className="about-taste__cta-media" aria-hidden="true">
            <Image
              src="/images/clean/about/cta.jpg"
              alt=""
              fill
              sizes="100vw"
              className="about-taste__cta-img"
            />
            <div className="about-taste__cta-veil" />
          </div>
          <div className="container">
            <Reveal className="about-taste__cta-inner">
              <h2 className="about-taste__section-title">Cùng chạm vào vẻ đẹp của đá</h2>
              <p className="about-taste__section-text">
                Xem bộ sưu tập hoặc liên hệ để được tư vấn không gian và phong thủy.
              </p>
              <div className="about-taste__cta-actions">
                <Link href="/shop" className="btn btn-success taste-btn">
                  Khám phá sản phẩm
                </Link>
                <Link href="/contact" className="btn btn-outline-success taste-btn taste-btn--ghost">
                  Liên hệ tư vấn
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
