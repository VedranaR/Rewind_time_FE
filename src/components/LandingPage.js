import classes from "./LandingPage.module.css";

function LandingPage() {
  return (
    <div className={classes.container}>
      <h1>Home Page</h1>
      <p>
        Step back into the golden age of movie nights with
        <span> Rewind Time</span>, the ultimate destination for VHS lovers and
        nostalgia seekers. Whether you grew up rewinding tapes or you're
        discovering the magic of analog for the first time, our collection of
        classics, cult favorites, and forgotten gems will take you on a
        cinematic journey to the past. From '80s action flicks and '90s rom-coms
        to Saturday morning cartoons, we’ve got that perfect fuzzy tape vibe you
        didn’t know you missed.
      </p>
      <p>
        At <span>Rewind Time</span>, we believe movie night should be an
        experience. Our cozy shop is decked out in vintage decor, complete with
        posters, tube TVs, and that unmistakable smell of worn-out plastic and
        popcorn. Come hang out, chat movies, and dig through our shelves – you
        never know what forgotten treasure you’ll find. So grab your tape,
        rewind it, and press play on a little piece of the past.
      </p>
    </div>
  );
}

export default LandingPage;
