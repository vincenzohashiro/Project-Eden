// Quiet static texture behind the home page: a faint neutral grid that fades
// out down the page, with the slightest warmth from each world's corner.
function HomeBackdrop() {
  return (
    <div className="home-backdrop" aria-hidden="true">
      <div className="hb-grid" />
      <div className="hb-vignette" />
    </div>
  )
}

export default HomeBackdrop
