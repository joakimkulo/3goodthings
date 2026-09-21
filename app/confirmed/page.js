export const metadata = {
  title: 'Subscription confirmed — 3 Good Things',
  description: 'Your subscription to 3 Good Things is confirmed.'
};

export default function ConfirmedPage() {
  return <main className="confirmation-page">
    <section className="confirmation-card">
      <a className="brand" href="/">3 Good Things</a>
      <p className="kicker">SUBSCRIPTION CONFIRMED</p>
      <h1>You’re all set.</h1>
      <p>Thank you for subscribing. Your next edition of 3 Good Things will arrive at 08:00 in your local timezone.</p>
      <a className="confirmation-button" href="/">Read today’s good news</a>
    </section>
  </main>;
}
