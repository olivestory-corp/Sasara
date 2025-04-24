import Setting from '@/pages/setting/Setting'
import { useIsSettingOpen } from '@/hooks/use-config'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export default function SettingsDialog() {
  const [isSettingOpen, setIsSettingOpen] = useIsSettingOpen()

  return (
    <Dialog open={isSettingOpen} onOpenChange={setIsSettingOpen}>
      <DialogContent className="max-w-3xl">
        <Setting />
      </DialogContent>
    </Dialog>
  )
}
