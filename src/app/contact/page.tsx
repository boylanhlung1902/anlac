'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import Link from 'next/link'
import { useState } from 'react'
import { phoneHref } from '@/lib/store-defaults'
import { useStoreInfo } from '@/lib/use-store'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const store = useStoreInfo()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          source: 'contact',
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        })
        setTimeout(() => setSubmitStatus('idle'), 5000)
      } else {
        setSubmitStatus('error')
        setErrorMessage(data.message || 'Có lỗi xảy ra khi gửi tin nhắn')
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      setSubmitStatus('error')
      setErrorMessage('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactPoints = [
    {
      icon: 'fa-map-marker-alt',
      title: 'Địa chỉ',
      body: <span style={{ whiteSpace: 'pre-line' }}>{store.address}</span>,
    },
    {
      icon: 'fa-phone',
      title: 'Điện thoại',
      body: (
        <a href={phoneHref(store.phone)} className="contact-taste__link">
          {store.phone}
        </a>
      ),
    },
    {
      icon: 'fa-envelope',
      title: 'Email',
      body: (
        <a href={`mailto:${store.email}`} className="contact-taste__link">
          {store.email}
        </a>
      ),
    },
    {
      icon: 'fa-clock',
      title: 'Giờ làm việc',
      body: (
        <>
          {store.hoursWeekday}
          <br />
          {store.hoursSaturday}
          <br />
          {store.hoursSunday}
        </>
      ),
    },
  ]

  const services = ['Tư vấn phong thủy', 'Chế tác theo yêu cầu', 'Giao hàng toàn quốc', 'Bảo hành sản phẩm']

  return (
    <div className="contact-taste">
      <Header />

      <section className="contact-taste__hero">
        <div className="contact-taste__hero-veil" aria-hidden="true" />
        <div className="container">
          <Reveal className="contact-taste__hero-copy">
            <p className="taste-kicker">An Lạc Stone</p>
            <h1 className="contact-taste__title">Liên hệ</h1>
            <p className="contact-taste__lead">
              Tư vấn đá cảnh, mỹ nghệ hoặc đặt hàng cho không gian của bạn.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="contact-taste__main">
        <div className="container">
          <div className="contact-taste__layout">
            <Reveal className="contact-taste__form-panel">
              <div className="contact-taste__panel">
                <h2 className="contact-taste__panel-title">Gửi tin nhắn</h2>
                <p className="contact-taste__panel-note">Chúng tôi phản hồi trong giờ làm việc.</p>

                {submitStatus === 'success' && (
                  <div className="contact-taste__alert contact-taste__alert--ok" role="status">
                    <i className="fas fa-check-circle" aria-hidden="true" />
                    <span>Tin nhắn đã gửi thành công. Chúng tôi sẽ phản hồi sớm.</span>
                    <button
                      type="button"
                      className="contact-taste__alert-close"
                      onClick={() => setSubmitStatus('idle')}
                      aria-label="Đóng thông báo"
                    >
                      <i className="fas fa-times" />
                    </button>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="contact-taste__alert contact-taste__alert--err" role="alert">
                    <i className="fas fa-exclamation-circle" aria-hidden="true" />
                    <span>{errorMessage}</span>
                    <button
                      type="button"
                      className="contact-taste__alert-close"
                      onClick={() => setSubmitStatus('idle')}
                      aria-label="Đóng thông báo"
                    >
                      <i className="fas fa-times" />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="contact-taste__form">
                  <div className="contact-taste__grid">
                    <div className="contact-taste__field">
                      <label htmlFor="name" className="contact-taste__label">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        className="form-control contact-taste__input"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        autoComplete="name"
                      />
                    </div>
                    <div className="contact-taste__field">
                      <label htmlFor="email" className="contact-taste__label">
                        Email *
                      </label>
                      <input
                        type="email"
                        className="form-control contact-taste__input"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="contact-taste__field">
                    <label htmlFor="phone" className="contact-taste__label">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      className="form-control contact-taste__input"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      autoComplete="tel"
                    />
                  </div>

                  <div className="contact-taste__field">
                    <label htmlFor="subject" className="contact-taste__label">
                      Tiêu đề *
                    </label>
                    <input
                      type="text"
                      className="form-control contact-taste__input"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="contact-taste__field">
                    <label htmlFor="message" className="contact-taste__label">
                      Nội dung *
                    </label>
                    <textarea
                      className="form-control contact-taste__input"
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-success taste-btn contact-taste__submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2" aria-hidden="true" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2" aria-hidden="true" />
                        Gửi tin nhắn
                      </>
                    )}
                  </button>
                </form>
              </div>
            </Reveal>

            <Reveal delayMs={80} className="contact-taste__side">
              <aside className="contact-taste__panel contact-taste__panel--side">
                <h2 className="contact-taste__panel-title">Thông tin liên hệ</h2>

                <ul className="contact-taste__points">
                  {contactPoints.map((item) => (
                    <li key={item.title} className="contact-taste__point">
                      <span className="contact-taste__point-icon" aria-hidden="true">
                        <i className={`fas ${item.icon}`} />
                      </span>
                      <div>
                        <h3 className="contact-taste__point-title">{item.title}</h3>
                        <p className="contact-taste__point-body">{item.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="contact-taste__services">
                  <h3 className="contact-taste__services-title">Dịch vụ</h3>
                  <div className="contact-taste__chips">
                    {services.map((service) => (
                      <span key={service} className="contact-taste__chip">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <Link href="/shop" className="contact-taste__shop-link">
                  Xem cửa hàng
                  <i className="fas fa-arrow-right" aria-hidden="true" />
                </Link>
              </aside>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="contact-taste__map">
        <div className="container">
          <Reveal>
            <div className="contact-taste__map-head">
              <h2 className="contact-taste__map-title">Vị trí cửa hàng</h2>
              <p className="contact-taste__map-note">Ghé showroom để xem đá thực tế.</p>
            </div>
            <div className="contact-taste__map-frame">
              <iframe
                title="Bản đồ cửa hàng An Lạc Stone"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.424098481303!2d106.6983153!3d10.7769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f46f64b933f%3A0xf8a6e5b2a5a4f1f4!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2jhu4cgVGjDtG5nIFRpbiA4!5e0!3m2!1svi!2s!4v1645000000000!5m2!1svi!2s"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}
