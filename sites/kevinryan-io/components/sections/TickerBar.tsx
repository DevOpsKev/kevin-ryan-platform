const TICKER_ITEMS = [
  "DevOps", "Platform Engineering", "AI-Native", "Kubernetes", "CI/CD",
  "Terraform", "Spec Driven Development", "Enterprise Delivery", "DORA Metrics", "Cloud Migration",
]

export default function TickerBar() {
  return (
    <div className="ticker">
      <div className="ticker__track">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} className="ticker__item">{item}</span>
        ))}
      </div>
    </div>
  )
}
