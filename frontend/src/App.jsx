import { Routes, Route } from 'react-router-dom'
import SetupPage from './app/routes/setup/SetupPage'
import BasketPage from './app/routes/basket/BasketPage'
import PlansPage from './app/routes/plans/PlansPage'
import AnalysisPage from './app/routes/analysis/AnalysisPage'
import CheckoutPage from './app/routes/checkout/CheckoutPage'
import CheckoutGuidePage from './app/routes/checkout/CheckoutGuidePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<SetupPage />} />
      <Route path="/basket" element={<BasketPage />} />
      <Route path="/analysis" element={<AnalysisPage />} />
      <Route path="/plans" element={<PlansPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/checkout/guide" element={<CheckoutGuidePage />} />
    </Routes>
  )
}

export default App
