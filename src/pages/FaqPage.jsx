import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Reveal from '../components/Reveal'
import './FaqPage.css'

const DISCORD_INVITE_URL = 'https://discord.gg/mEhgkyUxTF'

const ORDER_STEPS = [
  {
    title: 'Open a ticket',
    body: 'Create a ticket in #ticket-support and let us know what you need.',
  },
  {
    title: 'Provide your requirements',
    body: 'The more details you provide, the better we can bring your idea to life.',
    list: [
      ['Item type', 'Weapon, armor, block, furniture, tool, etc.'],
      ['Style reference', 'Images, examples, themes, or a description of your idea'],
      ['Minecraft version', 'The Paper / Spigot version you are using'],
    ],
  },
  {
    title: 'Receive your quote',
    body: "We review your request and send you a quote. Once you approve it, we start on your asset.",
    list: [
      ['Estimated price', null],
      ['Expected turnaround time', null],
      ['Any additional requirements', null],
    ],
  },
  {
    title: 'Development and integration',
    body: 'We build everything your server needs to use the asset.',
    list: [
      ['Custom model / texture', null],
      ['Resource pack integration', null],
      ['Installation instructions', null],
    ],
  },
  {
    title: 'Delivery',
    body: "After completion, you receive all final files, ready to use on your server.",
  },
]

const PRICING = [
  { name: 'Simple item skin', price: '50', note: 'Retextures and skins for existing items.' },
  { name: 'Custom 3D model', price: '120', note: 'Weapons and tools.' },
  { name: 'Furniture / block model', price: '25', note: 'Decor, seating, storage, and blocks.' },
  { name: 'Bulk pack', price: '120', note: '5+ items. Contact us for a custom quote.' },
]

const TURNAROUND_FACTORS = ['Model complexity', 'Number of requested items', 'Required integrations', 'Revision requests']

// Terms of Service, Project Eden Custom Item Commissions
const TERMS = [
  {
    title: 'Services provided',
    items: [
      'We create custom Minecraft item models, including but not limited to: custom skins, furniture, cosmetic sets, armor, tools, plushies, and entity models, delivered as textures, model files, and/or resource pack integrations.',
    ],
  },
  {
    title: 'Ordering process',
    items: [
      'All orders must be placed through a ticket in #ticket-support.',
      'A quote (price and estimated turnaround) will be provided before any work begins.',
      'Work begins only after the order is confirmed and payment terms are met.',
    ],
  },
  {
    title: 'Payment',
    items: [
      'Prices are quoted per item/set and may vary based on complexity.',
      'We reserve the right to decline or cancel an order at our discretion, in which case any deposit paid will be refunded in full.',
      'Accepted payment methods: GCash.',
    ],
  },
  {
    title: 'Refund policy',
    items: [
      'Once work has started, refunds are only available on a case-by-case basis and may be prorated based on progress completed.',
      'No refunds will be issued once the final files have been delivered and downloaded/accessed by the customer.',
      'If we are unable to complete an order, a full refund will be issued for any undelivered work.',
    ],
  },
  {
    title: 'Turnaround time',
    items: [
      'Estimated turnaround times are provided at the time of quoting and are not guaranteed. Delays can occur due to order volume or complexity.',
      'We will communicate any significant delays through your ticket.',
    ],
  },
  {
    title: 'Revisions',
    items: [
      'Up to 2 rounds of revisions are included per order.',
      'Additional revisions beyond this may incur an extra fee.',
      'Revisions must be requested within 2 days of delivery.',
    ],
  },
  {
    title: 'Usage rights and licensing',
    items: [
      'Purchased items are for personal or specified server use only, as agreed at the time of order.',
      'Reselling, redistributing, or claiming purchased models as your own original work is strictly prohibited unless explicitly agreed in writing.',
      'We retain the right to showcase completed work in #showcase and for portfolio/promotional purposes, unless the customer requests otherwise at the time of ordering.',
    ],
  },
  {
    title: 'Compatibility',
    items: [
      'Items are built for the Minecraft version specified at the time of order. Compatibility with other versions, mods, or plugins is not guaranteed unless explicitly discussed.',
      "It is the customer's responsibility to confirm their server setup (Paper/Spigot version, existing resource packs, plugin conflicts) before ordering.",
    ],
  },
  {
    title: 'Conduct',
    items: [
      'Harassment, threats, or abusive behavior toward staff or modelers will result in an immediate ban and cancellation of any pending orders without refund.',
      'Chargebacks or payment disputes filed without first attempting to resolve the issue through a ticket may result in a permanent ban from future services.',
    ],
  },
  {
    title: 'Limitation of liability',
    items: [
      'We are not responsible for any damage, data loss, or server issues resulting from the installation or use of purchased items.',
      'Items are provided "as is" based on the agreed specifications at the time of order.',
    ],
  },
  {
    title: 'Changes to these terms',
    items: [
      'We may update these Terms of Service at any time. Continued use of our services after changes are posted constitutes acceptance of the updated terms.',
    ],
  },
  {
    title: 'Contact',
    items: ['Questions about these terms can be directed to a ticket in #inquiry.'],
  },
]

const SECTIONS = [
  ['how-to-order', 'How to order'],
  ['pricing', 'Pricing'],
  ['turnaround', 'Turnaround'],
  ['terms', 'Terms of Service'],
]

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="M5 12.5 10 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function TermsItem({ term, index, open, onToggle }) {
  const id = `term-${index}`
  return (
    <li className={`faq-term${open ? ' is-open' : ''}`}>
      <h3>
        <button type="button" aria-expanded={open} aria-controls={id} onClick={onToggle}>
          <span className="faq-term-num">{String(index + 1).padStart(2, '0')}</span>
          <span className="faq-term-title">{term.title}</span>
          <span className="faq-term-chevron">
            <ChevronIcon />
          </span>
        </button>
      </h3>
      <div id={id} className="faq-term-body" role="region" hidden={!open}>
        <ul>
          {term.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </li>
  )
}

function FaqPage() {
  const { hash } = useLocation()
  const [openTerm, setOpenTerm] = useState(0)
  const [allOpen, setAllOpen] = useState(false)

  // the router resets scroll after this effect, so defer #section jumps
  useEffect(() => {
    if (!hash) return undefined
    const t = setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
    return () => clearTimeout(t)
  }, [hash])

  return (
    <div className="faq-page">
      <header className="faq-hero">
        <span className="faq-kicker">Eden Specialized</span>
        <h1>FAQ</h1>
        <p>
          How to order a custom Minecraft model or resource pack asset, what it costs, how long it
          takes, and the terms that apply to every commission.
        </p>
        <nav className="faq-jump" aria-label="On this page">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
      </header>

      <Reveal as="section" className="faq-block" direction="fade" id="how-to-order" aria-labelledby="order-title">
        <div className="faq-head">
          <h2 id="order-title">How to order</h2>
          <p>Want a custom Minecraft model or resource pack asset? Follow these steps.</p>
        </div>
        <ol className="faq-steps">
          {ORDER_STEPS.map((step, i) => (
            <li key={step.title} style={{ '--i': i }}>
              <span className="faq-step-num">{i + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                {step.list && (
                  <ul className="faq-step-list">
                    {step.list.map(([label, detail]) => (
                      <li key={label}>
                        <CheckIcon />
                        <span>
                          <strong>{label}</strong>
                          {detail && <> &middot; {detail}</>}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal as="section" className="faq-block" direction="fade" id="pricing" aria-labelledby="pricing-title">
        <div className="faq-head">
          <h2 id="pricing-title">Pricing</h2>
          <p>Starting prices. Your final price is set in your quote based on complexity.</p>
        </div>
        <div className="faq-prices">
          {PRICING.map((tier, i) => (
            <div key={tier.name} className="faq-price" style={{ '--i': i }}>
              <span className="faq-price-from">Starting at</span>
              <span className="faq-price-amount">
                <small>PHP</small>
                {tier.price}
              </span>
              <h3>{tier.name}</h3>
              <p>{tier.note}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="faq-block faq-turnaround" direction="fade" id="turnaround" aria-labelledby="turnaround-title">
        <div className="faq-turnaround-main">
          <h2 id="turnaround-title">Turnaround time</h2>
          <p className="faq-turnaround-range">
            2<span>–</span>31 <small>days</small>
          </p>
          <p>Estimated completion time, depending on:</p>
        </div>
        <ul className="faq-factors">
          {TURNAROUND_FACTORS.map((factor) => (
            <li key={factor}>{factor}</li>
          ))}
        </ul>
      </Reveal>

      <Reveal as="section" className="faq-block" direction="fade" id="terms" aria-labelledby="terms-title">
        <div className="faq-head faq-head-row">
          <div>
            <h2 id="terms-title">Terms of Service</h2>
            <p>
              Project Eden Custom Item Commissions. Last updated July 29, 2026. By placing an order,
              opening a ticket, or purchasing any item, you agree to these terms.
            </p>
          </div>
          <button type="button" className="faq-toggle-all" onClick={() => setAllOpen((v) => !v)}>
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        </div>
        <ol className="faq-terms">
          {TERMS.map((term, i) => (
            <TermsItem
              key={term.title}
              term={term}
              index={i}
              open={allOpen || openTerm === i}
              onToggle={() => {
                setAllOpen(false)
                setOpenTerm((cur) => (cur === i ? -1 : i))
              }}
            />
          ))}
        </ol>
      </Reveal>

      <section className="faq-cta">
        <h2>Have an idea?</h2>
        <p>Open a ticket and let&apos;s turn your vision into a custom Minecraft asset.</p>
        <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className="faq-btn">
          Open a ticket on Discord
        </a>
      </section>
    </div>
  )
}

export default FaqPage
