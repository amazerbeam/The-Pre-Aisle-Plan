import { useManageExtras } from '../../hooks/useManageExtras'
import { EXTRAS_SCOPE } from '../../constants/extraChoices'
import ManageExtrasModal from './ManageExtrasModal'

/** MPP-10 / AC 9: Manage extras for one saved template. Never touches dish defaults or any week. */
function TemplateExtrasModal({ template, onBack, onClose }) {
  const extras = useManageExtras({ scope: EXTRAS_SCOPE.TEMPLATE, templateId: template.id })
  return (
    <ManageExtrasModal
      title="Manage extras"
      subtitle={`Template · ${template.name}`}
      scopeNote="Changes apply to this template only. Your weeks change when you apply it."
      savedTo={`"${template.name}"`}
      emptyTitle="No extras in this template"
      emptyBody="None of this template's meals have a homemade or store-bought choice."
      showDates={false}
      extras={extras}
      onBack={onBack}
      onClose={onClose}
    />
  )
}

export default TemplateExtrasModal
