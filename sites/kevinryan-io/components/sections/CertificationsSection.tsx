import { CONTAINER } from "@/lib/constants"

export default function CertificationsSection() {
  return (
    <section className="section section--black" id="certs">
      <div style={CONTAINER}>
        <div className="section__header reveal">
          <div className="section__number">08</div>
          <div>
            <div className="section__subtitle">Certifications</div>
            <h2 className="display-lg">Verified<br />Expertise</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 reveal">
          <div className="cert-group">
            <h3 className="cert-group__title">GitHub ×4</h3>
            <ul className="cert-group__list">
              <li><a href="https://www.credly.com/badges/02e9c449-9385-4c95-9cfa-e72765f0d4de" target="_blank" rel="noopener noreferrer">Administration</a></li>
              <li><a href="https://www.credly.com/badges/b4a9987d-3a31-4cf3-8ee9-53607a4ef572" target="_blank" rel="noopener noreferrer">Actions</a></li>
              <li><a href="https://www.credly.com/badges/74bdfd55-a572-46a9-9c00-5d4158385ca9" target="_blank" rel="noopener noreferrer">Advanced Security</a></li>
              <li><a href="https://www.credly.com/badges/2cf756b5-013f-4336-adda-1af6ce3c11c8/public_url" target="_blank" rel="noopener noreferrer">Foundations</a></li>
            </ul>
          </div>
          <div className="cert-group">
            <h3 className="cert-group__title">GitLab ×6</h3>
            <ul className="cert-group__list">
              <li><a href="https://www.credly.com/badges/60bf5ece-b4b0-4bec-9c56-fc4d227fc689" target="_blank" rel="noopener noreferrer">Partner Technical Engineer</a></li>
              <li><a href="https://www.credly.com/badges/73b62343-d671-4477-b412-2d833dc4ea42/public_url" target="_blank" rel="noopener noreferrer">DevOps Professional</a></li>
              <li><a href="https://www.credly.com/badges/a64f651f-aa8c-4000-bf6e-9e5d3070dcb6/public_url" target="_blank" rel="noopener noreferrer">Security Specialist</a></li>
              <li><a href="https://www.credly.com/badges/90be4ffc-c869-4d0c-8143-99fcbe7099d5/public_url" target="_blank" rel="noopener noreferrer">Services Engineer Professional</a></li>
              <li><a href="https://www.credly.com/badges/5ed58594-5438-45df-b57a-f2f8ef7435eb/public_url" target="_blank" rel="noopener noreferrer">Migration Services Specialist</a></li>
              <li><a href="https://www.credly.com/badges/9340463c-a5d4-418e-9342-c18b145344e4/public_url" target="_blank" rel="noopener noreferrer">CI/CD Associate</a></li>
            </ul>
          </div>
          <div className="cert-group">
            <h3 className="cert-group__title">LaunchDarkly ×4</h3>
            <ul className="cert-group__list">
              <li><a href="https://verify.skilljar.com/c/b7tc7cjjjdv9" target="_blank" rel="noopener noreferrer">Platinum Developer</a></li>
              <li><a href="https://verify.skilljar.com/c/xvvkdsp227on" target="_blank" rel="noopener noreferrer">Gold Developer</a></li>
              <li><a href="https://verify.skilljar.com/c/cw4ix2japf23" target="_blank" rel="noopener noreferrer">Silver Developer</a></li>
              <li><a href="https://verify.skilljar.com/c/8m35pkrme9s8" target="_blank" rel="noopener noreferrer">Bronze Developer</a></li>
            </ul>
          </div>
          <div className="cert-group">
            <h3 className="cert-group__title">Education</h3>
            <ul className="cert-group__list">
              <li>Hons, Digital Media — Birmingham City University</li>
              <li>AI and Ethics — Trinity College Dublin</li>
              <li>MA Applied Linguistics — University of Pannonia <em style={{ color: 'var(--accent)', fontStyle: 'normal', fontSize: '0.68rem', fontWeight: 700 }}>(PLANNED)</em></li>
            </ul>
          </div>
        </div>
        <div className="award-banner reveal">
          <div className="award-banner__year">2014</div>
          <div className="award-banner__text">
            <strong>UK Agile Awards — Best Use of Agile in the Private Sector</strong>
            National recognition for enterprise agile delivery excellence.
          </div>
        </div>
      </div>
    </section>
  )
}
