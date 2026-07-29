import cityImg from '../assets/8-bit-graphics-pixels-scene-with-city-night.jpg'

function CityBackdrop() {
  return (
    <div className="site-bg" aria-hidden="true">
      <span className="site-corner tl" />
      <span className="site-corner tr" />
      <span className="site-corner bl" />
      <span className="site-corner br" />

      <div className="city" style={{ '--city-url': `url(${cityImg})` }}>
        <div className="city-photo" />
        <div className="city-glow" />
        <div className="city-haze" />

        <div className="maglev">
          <span className="maglev-pulse p1" />
          <span className="maglev-pulse p2" />
        </div>

        <div className="traffic">
          <span className="car c1" />
          <span className="car c2" />
          <span className="car c3" />
          <span className="car c4" />
          <span className="car c5" />
          <span className="car c6" />
        </div>
      </div>
    </div>
  )
}

export default CityBackdrop
