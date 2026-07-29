import logoBase from '../assets/ProjectEden2.png'
import logoAlt1 from '../assets/ProjectEden1.png'
import logoAlt2 from '../assets/SpecializedRed.png'

function GlitchLogo() {
  return (
    <span className="logo-wrap">
      <img className="logo-img base" src={logoBase} alt="Project Eden" />
      <img className="logo-img alt1" src={logoAlt1} alt="" aria-hidden="true" />
      <img className="logo-img alt2" src={logoAlt2} alt="" aria-hidden="true" />
    </span>
  )
}

export default GlitchLogo
