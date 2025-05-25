import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  onConfirm: () => void
  onClose: () => void
  loading?: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  loading = false,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {variant === "destructive" && <AlertTriangle className="h-5 w-5 text-red-500" />}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={loading}
            className={variant === "default" ? "bg-[#1e3a8a] hover:bg-[#1e3a8a]/90" : ""}
          >
            {loading ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
