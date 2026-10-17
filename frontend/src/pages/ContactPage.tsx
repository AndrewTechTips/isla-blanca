import { Mail, MapPin, Phone } from 'lucide-react'
import { motion } from 'motion/react'
import { type FormEvent, useId, useState } from 'react'

import { Reveal } from '@/components/motion/Reveal'
import { CtaBand } from '@/components/sections/CtaBand'
import { Faq } from '@/components/sections/Faq'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { site } from '@/data/site'
import { usePageTitle } from '@/hooks/usePageTitle'
import { hero, tween } from '@/lib/motion'
import { sketch } from '@/lib/sketch'

const fieldClass =
  'w-full rounded-[5px] bg-white/10 px-3 py-2.5 text-sm text-cream outline-none transition-colors placeholder:text-cream/60 focus:bg-white/15'

function ContactForm() {
  const id = useId()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const update = (field: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  // No mail service yet: open the guest's email app with everything filled in.
  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const body = `${form.message}\n\n${form.name} (${form.email})`
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(body)}`
  }

  const fields = [
    { key: 'name', label: 'Name', type: 'text', placeholder: 'Your name', autoComplete: 'name' },
    {
      key: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'you@example.com',
      autoComplete: 'email',
    },
    {
      key: 'subject',
      label: 'Subject',
      type: 'text',
      placeholder: 'What is it about?',
      autoComplete: 'off',
    },
  ] as const

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-left">
      {fields.map((field) => (
        <div key={field.key} className="space-y-2">
          <label htmlFor={`${id}-${field.key}`} className="text-label text-gold">
            {field.label}
          </label>
          <input
            id={`${id}-${field.key}`}
            type={field.type}
            required
            autoComplete={field.autoComplete}
            placeholder={field.placeholder}
            value={form[field.key]}
            onChange={update(field.key)}
            className={fieldClass}
          />
        </div>
      ))}
      <div className="space-y-2">
        <label htmlFor={`${id}-message`} className="text-label text-gold">
          Message
        </label>
        <textarea
          id={`${id}-message`}
          required
          rows={5}
          placeholder="How can we help?"
          value={form.message}
          onChange={update('message')}
          className={fieldClass}
        />
      </div>
      <Button type="submit" variant="gold" className="w-full">
        Send Message
      </Button>
    </form>
  )
}

export function ContactPage() {
  usePageTitle('Contact')

  return (
    <>
      <section className="relative isolate overflow-hidden pt-32 pb-16 md:pb-24">
        <motion.img
          src="/images/gallery/gallery-05.jpg"
          alt=""
          className="absolute inset-0 -z-10 size-full object-cover"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={hero.photo}
        />
        <div className="container-site">
          <Reveal
            onMount
            y={40}
            transition={hero.title}
            className="mx-auto max-w-[600px] space-y-6 rounded-xl bg-forest/95 px-6 py-10 text-center text-sand md:px-14"
          >
            <Eyebrow>Contact</Eyebrow>
            <h1 className="text-heading font-medium text-cream">Get in Touch</h1>
            <p>
              Planning a getaway, celebrating something special or just curious? Our team is here to
              help and would love to hear from you.
            </p>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      <section className="sketch-bg section-y" style={sketch('/images/home/about-bg.jpg')}>
        <div className="container-site grid gap-12 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <Eyebrow>Our location</Eyebrow>
            <h2 className="text-heading text-ink">Isla Blanca Resort</h2>
            <p className="max-w-[440px]">
              Tucked into a quiet corner of Ibiza’s west coast, minutes from Cala d’Hort and the
              legendary sunsets of Es Vedrà.
            </p>
            <ul className="space-y-5">
              <li>
                <a
                  href={`tel:${site.phone.replaceAll(' ', '')}`}
                  className="inline-flex items-center gap-4 underline underline-offset-4"
                >
                  <Phone className="size-6 text-gold" strokeWidth={1.4} /> {site.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-center gap-4 underline underline-offset-4"
                >
                  <Mail className="size-6 text-gold" strokeWidth={1.4} /> {site.email}
                </a>
              </li>
              <li className="inline-flex items-start gap-4">
                <MapPin className="size-6 shrink-0 text-gold" strokeWidth={1.4} />
                <span>{site.address.join(', ')}</span>
              </li>
            </ul>
          </div>
          <motion.div
            className="aspect-[4/3] overflow-hidden rounded-xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={tween(1.3)}
          >
            <iframe
              title="Map of Isla Blanca Resort"
              src={`https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&z=13&output=embed`}
              className="size-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </section>
      <CtaBand />
      <Faq />
    </>
  )
}
