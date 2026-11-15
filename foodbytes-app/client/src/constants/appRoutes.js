import { PET_GUEST_MESSAGE } from './pet'

export const APP_NAME = 'My Pantry Plan'

export const RECIPES_PATH = '/'
export const MEALPLAN_PATH = '/mealplan'
export const PET_PATH = '/pet'
export const SHOPPING_PATH = '/shopping'

/** The four app sections, in nav order. Shared by the header nav, the footer nav and page titles. */
export const APP_ROUTES = [
  { key: 'recipes', path: RECIPES_PATH, label: 'Recipes', title: 'Recipes', requiresAuth: false },
  { key: 'mealplan', path: MEALPLAN_PATH, label: 'Meal Plan', title: 'Meal Plan', requiresAuth: true,
    guestMessage: 'Sign in to access meal planning!' },
  { key: 'pet', path: PET_PATH, label: null, title: 'Pip', requiresAuth: true, guestMessage: PET_GUEST_MESSAGE },
  { key: 'shopping', path: SHOPPING_PATH, label: 'Shopping', title: 'Shopping', requiresAuth: true,
    guestMessage: 'Sign in to access shopping list!' }
]

/** "Meal Plan · My Pantry Plan"; trailing slashes ignored; unknown paths get the bare app name. `appName` is the active theme's brand name. */
export function routeTitle(pathname, appName = APP_NAME) {
  const clean = (pathname || '/').replace(/\/+$/, '') || '/'
  const route = APP_ROUTES.find(r => r.path === clean)
  return route ? `${route.title} · ${appName}` : appName
}
