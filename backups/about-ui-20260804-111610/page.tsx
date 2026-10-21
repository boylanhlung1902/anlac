import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Giới Thiệu - An Lạc Stone',
  description:
    'Câu chuyện An Lạc Stone — hành trình đam mê đá cảnh và mỹ nghệ, từ đá tự nhiên đến sản phẩm chế tác tinh xảo.',
}

const features = [
  {
    id: 'natural',
    title: 'Đá tự nhiên',
    text: 'Chúng tôi không chỉ mang đến những phiến đá, mà là từng mảnh ký ức của thiên nhiên – mỗi đường vân, mỗi sắc màu đều là dấu ấn thời gian không thể lặp lại. Đá thiên nhiên không chỉ dùng để xây dựng, mà để kể lại một câu chuyện – câu chuyện về sự trường tồn, sang trọng và kết nối giữa con người với đất mẹ.',
    href: '/shop',
    image: '/images/clean/about/natural.jpg',
    imageAlt: 'Đá tự nhiên An Lạc Stone',
    reverse: false,
  },
  {
    id: 'craft',
    title: 'Sản phẩm mỹ nghệ',
    text: 'Chúng tôi không bán những món đồ đơn thuần. Chúng tôi kể lại câu chuyện của làng nghề, của truyền thống, của vẻ đẹp lặng lẽ mà tinh tế. Trong từng món mỹ nghệ là một phần hồn Việt – gần gũi, giản dị mà sâu sắc.',
    href: '/shop',
    image: '/images/clean/about/craft.jpg',
    imageAlt: 'Sản phẩm mỹ nghệ đá',
    reverse: true,
  },
  {
    id: 'service',
    title: 'Dịch vụ',
    text: 'Từ khâu khai thác tại mỏ đá với quy trình an toàn, bền vững, đến chế tác tinh xảo tại xưởng bằng công nghệ hiện đại kết hợp tay nghề truyền thống – chúng tôi kiểm soát chặt chẽ từng chi tiết. Sản phẩm sau đó được phân phối rộng khắp, đảm bảo đến tay khách hàng đúng chất lượng, đúng thời gian.',
    href: '/contact',
    image: '/images/clean/about/service.jpg',
    imageAlt: 'Dịch vụ chế tác đá',
    reverse: false,
  },
  {
    id: 'showroom',
    title: 'Showroom & Kho đá',
    text: 'Không gian trưng bày nơi bạn có thể chạm tay vào từng khối đá, cảm nhận chất liệu và chọn lựa tác phẩm phù hợp với không gian sống. Kho đá phong phú – từ đá cảnh đến mỹ nghệ – luôn sẵn sàng cho hành trình khám phá của bạn.',
    href: '/contact',
    image: '/images/clean/about/showroom.jpg',
    imageAlt: 'Showroom và kho đá',
    reverse: true,
  },
]

export default function About() {
  return (
    <>
      <Header />

      <main className="about-page">
        {/* Hero */}
        <section className="about-hero">
          <div className="about-hero__media" aria-hidden="true">
            <Image
              src="/images/clean/about/hero.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="about-hero__img"
            />
            <div className="about-hero__veil" />
          </div>
          <div className="about-hero__content">
            <p className="about-hero__eyebrow">Vũ điệu của đá</p>
            <h1 className="about-hero__brand">An Lạc Stone</h1>
            <p className="about-hero__sub">Khám phá về chúng tôi</p>
            <a href="#cau-chuyen" className="about-scroll-hint" aria-label="Xuống phần câu chuyện">
              <span />
            </a>
          </div>
        </section>

        {/* Story */}
        <section id="cau-chuyen" className="about-story">
          <div className="about-story__bg" aria-hidden="true">
            <Image
              src="/images/clean/about/story-bg.jpg"
              alt=""
              fill
              sizes="100vw"
              className="about-story__bg-img"
            />
            <div className="about-story__veil" />
          </div>
          <div className="container about-story__inner">
            <div className="about-story__copy">
              <h2 className="about-section-title">
                Câu chuyện
                <br />
                về chúng tôi
              </h2>
              <p className="about-section-text">
                Xuất phát từ con số 0 và niềm đam mê dành cho đá, An Lạc Stone đã bắt đầu hành trình
                giữa lòng Sài Gòn. Không có gì ngoài ý chí và trực giác với cái đẹp — rong ruổi khắp
                núi non, sông suối để tìm kiếm những khối đá mang dấu ấn tự nhiên hiếm có.
              </p>
              <Link href="/shop" className="about-link">
                Xem thêm
                <span aria-hidden="true"> →</span>
              </Link>
            </div>
            <div className="about-story__figure">
              <Image
                src="/images/clean/about/story-photo.jpg"
                alt="Khối đá tự nhiên chọn lọc"
                width={640}
                height={800}
                className="about-story__photo"
              />
            </div>
          </div>
        </section>

        {/* Feature bands */}
        {features.map((feature) => (
          <section
            key={feature.id}
            id={feature.id}
            className={`about-band${feature.reverse ? ' about-band--reverse' : ''}`}
          >
            <div className="about-band__media">
              <Image
                src={feature.image}
                alt={feature.imageAlt}
                fill
                sizes="(max-width: 991px) 100vw, 50vw"
                className="about-band__img"
              />
              <div className="about-band__media-veil" />
            </div>
            <div className="about-band__copy">
              <h2 className="about-section-title">{feature.title}</h2>
              <p className="about-section-text">{feature.text}</p>
              <Link href={feature.href} className="about-link">
                Xem thêm
                <span aria-hidden="true"> →</span>
              </Link>
            </div>
          </section>
        ))}

        {/* Closing CTA */}
        <section className="about-cta">
          <div className="about-cta__bg" aria-hidden="true">
            <Image
              src="/images/clean/about/cta.jpg"
              alt=""
              fill
              sizes="100vw"
              className="about-cta__img"
            />
            <div className="about-cta__veil" />
          </div>
          <div className="container about-cta__inner">
            <h2 className="about-section-title">Cùng chạm vào vẻ đẹp của đá</h2>
            <p className="about-section-text about-cta__text">
              Khám phá bộ sưu tập đá cảnh và mỹ nghệ, hoặc liên hệ để được tư vấn không gian và phong thủy.
            </p>
            <div className="about-cta__actions">
              <Link href="/shop" className="about-btn about-btn--solid">
                Khám phá sản phẩm
              </Link>
              <Link href="/contact" className="about-btn about-btn--ghost">
                Liên hệ tư vấn
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
