// app/admin/students/[id]/payments/create-payment-modal.tsx
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { CurrencyInput } from "@/components/ui/currency-input";

// Types
type PaymentType = "RECEIVE" | "RETURN" | "DISCOUNT";
type PaymentMethod = "CASH" | "FIB" | "FASTPAY";

interface Installment {
  id: string;
  title: string;
  installmentNo: number;
  amount: number;
}

interface CreatePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  installments: Installment[];
}

interface FormData {
  installmentId: string;
  amount: string;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  discountPercent: string;
  receiptFile: File | null;
}

const INITIAL_FORM_STATE: FormData = {
  installmentId: "",
  amount: "",
  paymentType: "RECEIVE",
  paymentMethod: "CASH",
  discountPercent: "",
  receiptFile: null,
};

export function CreatePaymentModal({
  open,
  onOpenChange,
  studentId,
  installments,
}: CreatePaymentModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);

  const selectedInstallment = useMemo(
    () => installments.find((inst) => inst.id === formData.installmentId),
    [installments, formData.installmentId],
  );

  const calculatedDiscountAmount = useMemo(() => {
    if (formData.paymentType !== "DISCOUNT") return 0;
    if (!selectedInstallment) return 0;

    const discountPercent = parseFloat(formData.discountPercent) || 0;
    if (discountPercent <= 0 || discountPercent > 100) return 0;

    return Number(
      ((selectedInstallment.amount * discountPercent) / 100).toFixed(2),
    );
  }, [selectedInstallment, formData.discountPercent, formData.paymentType]);

  // Auto-fill amount when installment is selected (for RECEIVE type)
  useEffect(() => {
    if (
      selectedInstallment &&
      formData.paymentType === "RECEIVE" &&
      !formData.amount
    ) {
      setFormData((prev) => ({
        ...prev,
        amount: selectedInstallment.amount.toString(),
      }));
    }
  }, [selectedInstallment, formData.paymentType, formData.amount]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData(INITIAL_FORM_STATE);
    }
  }, [open]);

  // Handle file selection
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error("قەبارەی فایلەکە زۆر گەورەیە (زیاتر لە 5MB)");
          return;
        }
        // Validate file type
        if (file.type !== "application/pdf") {
          toast.error("تەنها فایلی PDF پەسەندکراوە");
          return;
        }
        setFormData((prev) => ({ ...prev, receiptFile: file }));
      }
    },
    [],
  );

  // Form validation
  const validateForm = useCallback((): string | null => {
    if (!formData.installmentId) return "تکایە کرێێک هەڵبژێرە";

    if (formData.paymentType !== "DISCOUNT") {
      const amount = parseFloat(formData.amount);
      if (!formData.amount || isNaN(amount) || amount <= 0) {
        return "تکایە بڕێکی دروست بنووسە";
      }
    }

    if (formData.paymentType === "DISCOUNT") {
      const discountPercent = parseFloat(formData.discountPercent);
      if (
        !formData.discountPercent ||
        isNaN(discountPercent) ||
        discountPercent <= 0 ||
        discountPercent > 100
      ) {
        return "ڕێژەی داشکاندن دەبێت لە نێوان 0 بۆ 100 بێت";
      }
      if (!formData.receiptFile) {
        return "تکایە فایلی وەسڵ هاوپێچ بکە";
      }
    }

    return null;
  }, [formData]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);

    try {
      let receiptUrl = "";

      // Upload file if it's a discount payment
      if (formData.paymentType === "DISCOUNT" && formData.receiptFile) {
        const fileFormData = new FormData();
        fileFormData.append("file", formData.receiptFile);
        fileFormData.append("studentId", studentId);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: fileFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error("فایلەکە بارنەبوو");
        }

        const uploadData = await uploadResponse.json();
        receiptUrl = uploadData.url;
      }

      // Create payment
      const paymentData = {
        studentId,
        installmentId: formData.installmentId,
        amount:
          formData.paymentType === "DISCOUNT" ? 0 : parseFloat(formData.amount),
        paymentType: formData.paymentType,
        paymentMethod: formData.paymentMethod,
        ...(formData.paymentType === "DISCOUNT" && {
          discountPercent: parseFloat(formData.discountPercent),
          discountAmount: calculatedDiscountAmount,
          receiptUrl,
        }),
      };

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment");
      }

      toast.success("وەسڵەکە بە سەرکەوتوویی زیادکرا");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "هەڵەیەک ڕوویدا";
      toast.error(errorMessage);
      console.error("Payment creation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>زیادکردنی وەسڵی نوێ</DialogTitle>
          <DialogDescription>زانیاریەکانی وەسڵەکە پڕبکەرەوە</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Installment Selection */}
            <div className="grid gap-2">
              <Label htmlFor="installment" className="text-right">
                کرێ <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.installmentId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, installmentId: value }))
                }
                disabled={isLoading}
              >
                <SelectTrigger id="installment">
                  <SelectValue placeholder="کرێێک هەڵبژێرە" />
                </SelectTrigger>
                <SelectContent>
                  {installments.map((installment) => (
                    <SelectItem key={installment.id} value={installment.id}>
                      <div className="flex justify-between items-center w-full gap-2">
                        <span>{installment.title}</span>
                        <span className="text-muted-foreground text-sm">
                          ({installment.amount.toLocaleString()})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Type */}
            <div className="grid gap-2">
              <Label htmlFor="paymentType" className="text-right">
                جۆری پارەدان <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.paymentType}
                onValueChange={(value: PaymentType) =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentType: value,
                    // Reset discount fields when changing type
                    discountPercent:
                      value === "DISCOUNT" ? prev.discountPercent : "",
                    receiptFile: value === "DISCOUNT" ? prev.receiptFile : null,
                  }))
                }
                disabled={isLoading}
              >
                <SelectTrigger id="paymentType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECEIVE">وەرگرتن</SelectItem>
                  <SelectItem value="RETURN">گەڕانەوە</SelectItem>
                  <SelectItem value="DISCOUNT">داشکاندن</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.paymentType === "DISCOUNT" ? (
              <>
                {/* Discount Fields */}

                <div className="grid gap-2">
                  <Label htmlFor="discountPercent" className="text-right">
                    ڕێژەی داشکاندن (%){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <CurrencyInput
                    id="discountPercent"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={formData.discountPercent}
                    disabled={isLoading}
                    className="text-right"
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        discountPercent: value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-right">بڕی داشکاندن (هەزار)</Label>
                  <div className="rounded-md border bg-muted px-3 py-2 text-right font-mono">
                    {calculatedDiscountAmount.toFixed(2)} هەزار
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="receiptFile" className="text-right">
                    فایلی وەسڵ (PDF) <span className="text-destructive">*</span>
                  </Label>

                  <div className="flex items-center gap-2">
                    <Input
                      id="receiptFile"
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      disabled={isLoading}
                      className="hidden"
                    />
                    <Label
                      htmlFor="receiptFile"
                      className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      <Upload className="h-4 w-4" />
                      {formData.receiptFile
                        ? formData.receiptFile.name
                        : "فایلێک هەڵبژێرە"}
                    </Label>
                  </div>

                  <p className="text-xs text-muted-foreground text-right">
                    تەنها PDF، زیاتر نەبێت لە 5MB
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Amount Input */}

                <div className="grid gap-2">
                  <Label htmlFor="amount" className="text-right">
                    بڕی پارە (IQD) <span className="text-destructive">*</span>
                  </Label>
                  <CurrencyInput
                    step="0.01"
                    placeholder="0"
                    value={formData.amount}
                    disabled={isLoading}
                    className="text-right"
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, amount: value }))
                    }
                  />

                  {selectedInstallment && (
                    <p className="text-xs text-muted-foreground text-right">
                      بڕی کرێ: {selectedInstallment.amount.toLocaleString()}{" "}
                      هەزار
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Payment Method */}
            <div className="grid gap-2">
              <Label htmlFor="paymentMethod" className="text-right">
                شێوازی پارەدان <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value: PaymentMethod) =>
                  setFormData((prev) => ({ ...prev, paymentMethod: value }))
                }
                disabled={isLoading}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">کاش</SelectItem>
                  <SelectItem value="FIB">FIB</SelectItem>
                  <SelectItem value="FASTPAY">فاستپەی</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              پاشگەزبوونەوە
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              زیادکردن
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
