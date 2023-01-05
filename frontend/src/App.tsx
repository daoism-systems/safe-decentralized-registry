import './App.css';
import SafeDemo from './components/SafeDemo'
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material'

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff4f00',
    },
  },
})

function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <header className="App-header">
          <p>
            Safe POC
          </p>
        </header>
        <div className="App-content">
          <SafeDemo />
        </div>
      </ThemeProvider>
    </div>
  );
}

export default App;