/** Custom recipe folders. Limits mirror RecipeFolderTree on the backend. */
export const FOLDER_MAX_DEPTH = 3
export const FOLDER_NAME_MAX = 40
export const RECIPE_VIEW_STORAGE_KEY = 'fb.recipes.view'
export const RECIPE_VIEWS = { MENU: 'menu', FOLDERS: 'folders' }
/** dataTransfer type for dragging a recipe card onto a folder (desktop). */
export const FOLDER_DRAG_TYPE = 'application/x-fb-recipe'
/** Fine pointer + hover: where drag-and-drop filing is offered. */
export const FOLDER_DRAG_MEDIA = '(hover: hover) and (pointer: fine)'
export const FOLDER_LOAD_ERROR = "Couldn't load your folders."
export const FOLDER_SAVE_ERROR = "Couldn't update your folders. Please try again."
