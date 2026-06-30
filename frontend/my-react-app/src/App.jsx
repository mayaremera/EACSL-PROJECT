import AppRouter from './routes/AppRouter'
import RealtimeSync from './components/RealtimeSync'
import './App.css'

function App() {

  return (
    <>
      <RealtimeSync />
      <AppRouter />
    </>
  )
}

export default App
