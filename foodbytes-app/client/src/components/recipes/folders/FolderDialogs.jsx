import { useState } from 'react'
import MealPlanSheet from '../../mealplan/MealPlanSheet'
import FolderIcon from './FolderIcon'
import FolderTree from './FolderTree'
import FolderAddRecipesList from './FolderAddRecipesList'
import { FOLDER_NAME_MAX } from '../../../constants/recipeFolders'
import { hideKeyOf } from '../../../utils/recipeCatalogueUtils'
import {
  canMoveTo, childrenOf, depthOf, folderById, pathOf, visibleCount
} from '../../../utils/recipeFolderTree'
import './RecipeFolders.css'

const pathText = (folders, id) => pathOf(folders, id).map((f) => f.name).join(' › ')

/** new / rename: one name input; the dialog stays open and shows the server's message when a save fails. */
function NameDialog({ dialog, setDialog, foldersApi, onOpenFolder }) {
  const renaming = dialog.type === 'rename'
  const { folders } = foldersApi
  const [name, setName] = useState(renaming ? folderById(folders, dialog.folderId)?.name ?? '' : '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const close = () => setDialog(null)

  const save = async () => {
    setBusy(true)
    setError('')
    const result = renaming
      ? await foldersApi.rename(dialog.folderId, name)
      : await foldersApi.create(name, dialog.parentId ?? null)
    setBusy(false)
    if (!result.ok) { setError(result.error); return }
    if (renaming) { close(); return }
    if (dialog.recipe) {
      foldersApi.addRecipe(result.folder.id, dialog.recipe, { silent: true })
      setDialog(dialog.back)
    } else {
      close()
      onOpenFolder(result.folder.id)
    }
  }

  const title = renaming ? 'Rename folder' : dialog.parentId ? 'New subfolder' : 'New folder'
  return (
    <MealPlanSheet title={title} onClose={close}>
      {!renaming && (
        <p className="folder-dialog-note">
          {dialog.parentId ? <>Inside <b>{pathText(folders, dialog.parentId)}</b>.</> : 'At the top level.'}
          {dialog.recipe && <> <b>{dialog.recipe.name}</b> goes straight in.</>}
        </p>
      )}
      <label className="folder-name-label" htmlFor="folder-name-input">Folder name</label>
      <input id="folder-name-input" className="folder-name-input" maxLength={FOLDER_NAME_MAX} autoFocus
        value={name} onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && name.trim() && !busy) save() }} />
      {error && <p className="folder-dialog-error" role="alert">{error}</p>}
      <button type="button" className="folder-primary-btn" disabled={busy || !name.trim()} onClick={save}>
        {renaming ? 'Save' : 'Create folder'}
      </button>
    </MealPlanSheet>
  )
}

/** Pick a new parent. Options that would break the depth or cycle rules are disabled with a reason. */
function MoveDialog({ dialog, setDialog, foldersApi }) {
  const { folders } = foldersApi
  const folder = folderById(folders, dialog.folderId)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (!folder) return null

  const moveTo = async (parentId) => {
    setBusy(true)
    setError('')
    const result = await foldersApi.move(folder.id, parentId)
    setBusy(false)
    if (result.ok) setDialog(null)
    else setError(result.error)
  }

  const option = (key, label, parentId, depth) => {
    const isCurrent = (folder.parentId ?? null) === parentId
    const allowed = canMoveTo(folders, folder.id, parentId)
    return (
      <button key={key} type="button" className="folder-move-option" style={{ '--d': depth }}
        disabled={busy || isCurrent || !allowed} onClick={() => moveTo(parentId)}>
        {parentId == null ? <span className="folder-icon" aria-hidden="true">☰</span> : <FolderIcon />}
        <span className="folder-row-label">{label}</span>
        {isCurrent ? <small>current</small> : !allowed && parentId !== folder.id && <small>too deep</small>}
      </button>
    )
  }
  const walk = (parentId) => childrenOf(folders, parentId).flatMap((f) => [
    option(f.id, f.name, f.id, depthOf(folders, f.id)), ...walk(f.id)])

  return (
    <MealPlanSheet title={`Move “${folder.name}”`} onClose={() => setDialog(null)}>
      <p className="folder-dialog-note">Its recipes and subfolders come with it. Folders go up to 3 levels deep.</p>
      <div className="folder-move-list">{option('top', 'Top level', null, 0)}{walk(null)}</div>
      {error && <p className="folder-dialog-error" role="alert">{error}</p>}
    </MealPlanSheet>
  )
}

/** Confirm-only delete: recipes are never deleted, subfolders move up one level. */
function DeleteDialog({ dialog, setDialog, foldersApi, isHiddenKey, onOpenFolder, currentId }) {
  const { folders } = foldersApi
  const folder = folderById(folders, dialog.folderId)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (!folder) return null

  const subs = childrenOf(folders, folder.id).length
  const recipes = visibleCount(folder, isHiddenKey)
  const parentName = folder.parentId == null ? 'the top level' : `“${folderById(folders, folder.parentId)?.name}”`

  const confirm = async () => {
    setBusy(true)
    setError('')
    const result = await foldersApi.removeFolder(folder.id)
    setBusy(false)
    if (!result.ok) { setError(result.error); return }
    setDialog(null)
    if (currentId === folder.id) onOpenFolder(folder.parentId ?? null)
  }

  return (
    <MealPlanSheet title={`Delete “${folder.name}”?`} onClose={() => setDialog(null)}>
      <p className="folder-dialog-note">
        Only the folder goes. <b>No recipes are deleted</b>, they stay in the app and in any other folder. This can't be undone.
      </p>
      <p className="folder-dialog-note">
        {recipes} recipe{recipes === 1 ? '' : 's'} · {subs} subfolder{subs === 1 ? '' : 's'}.
        {subs > 0 && <> Its subfolders move up to {parentName}.</>}
      </p>
      {error && <p className="folder-dialog-error" role="alert">{error}</p>}
      <button type="button" className="folder-primary-btn danger" disabled={busy} onClick={confirm}>Delete folder</button>
    </MealPlanSheet>
  )
}

/** Tick every folder a recipe should sit in. */
function AddToDialog({ dialog, setDialog, foldersApi, isHiddenKey }) {
  const { folders } = foldersApi
  const key = hideKeyOf(dialog.recipe)
  const inCount = folders.filter((f) => f.recipeIds.includes(key)).length
  return (
    <MealPlanSheet title="Add to folder" onClose={() => setDialog(null)}>
      <p className="folder-dialog-note">
        <b>{dialog.recipe.name}</b> can sit in as many folders as you like. In {inCount} now.
      </p>
      {folders.length === 0 && <p className="folder-dialog-note">You have no folders yet.</p>}
      <FolderTree mode="pick" folders={folders} isHiddenKey={isHiddenKey} pickedKey={key}
        onTogglePick={(id) => foldersApi.toggleRecipe(id, dialog.recipe)} />
      <button type="button" className="folder-new-btn"
        onClick={() => setDialog({ type: 'new', parentId: null, recipe: dialog.recipe, back: dialog })}>
        ＋ New folder…
      </button>
      <button type="button" className="folder-primary-btn" onClick={() => setDialog(null)}>Done</button>
    </MealPlanSheet>
  )
}

/** Folders list in a sheet (mobile). Opening a folder closes it. */
function SheetDialog({ setDialog, treeProps }) {
  const open = (id) => { setDialog(null); treeProps.onOpenFolder(id) }
  return (
    <MealPlanSheet title="Folders" onClose={() => setDialog(null)}>
      <FolderTree mode="nav" {...treeProps} onOpenFolder={open} />
      <button type="button" className="folder-new-btn" onClick={() => setDialog({ type: 'new', parentId: null })}>
        ＋ New folder
      </button>
    </MealPlanSheet>
  )
}

/** Every folder dialog, switched on `dialog.type`. All render in the MealPlanSheet shell. */
function FolderDialogs(props) {
  switch (props.dialog.type) {
    case 'sheet': return <SheetDialog {...props} />
    case 'new':
    case 'rename': return <NameDialog key={props.dialog.type} {...props} />
    case 'move': return <MoveDialog {...props} />
    case 'delete': return <DeleteDialog {...props} currentId={props.treeProps.currentId} />
    case 'addTo': return <AddToDialog {...props} />
    case 'addRecipes': return <FolderAddRecipesList {...props} />
    default: return null
  }
}

export default FolderDialogs
