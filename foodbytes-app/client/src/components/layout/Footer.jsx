import useAppNav from '../../hooks/useAppNav'
import AppNavItems from './AppNavItems'
import './Footer.css'

/** Mobile/tablet tab bar. Hidden from 1024px up (the header nav takes over), except on /pet. */
function Footer({ alwaysVisible = false }) {
  const { items, message } = useAppNav()
  return (
    <footer className={`footer ${alwaysVisible ? 'footer--always' : ''}`}>
      <AppNavItems variant="footer" items={items} message={message} />
    </footer>
  )
}

export default Footer
