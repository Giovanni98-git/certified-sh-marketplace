import { createFileRoute } from '@tanstack/react-router'
import logo from '../logo.svg'
import Marketplace from '@/components/Marketplace'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <Marketplace></Marketplace>
  )
}
