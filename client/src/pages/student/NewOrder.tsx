import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PartyPopper, ArrowLeft, ArrowRight } from 'lucide-react';
import { api, getErrorMessage } from '../../lib/api';
import { estimatePageCount } from '../../lib/pdfPageCount';
import { PublicSettings, Service } from '../../types';
import { FileDropzone } from '../../components/FileDropzone';
import { PriceBreakdown } from '../../components/PriceBreakdown';
import { Spinner } from '../../components/Spinner';

type ColorMode = 'bw' | 'color';
type Sides = 'single' | 'double';

const STEP_LABELS = ['Upload', 'Options', 'Review', 'Done'];

export function NewOrder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');
  const [estimatedPages, setEstimatedPages] = useState(0);

  const [colorMode, setColorMode] = useState<ColorMode>('bw');
  const [sides, setSides] = useState<Sides>('single');
  const [copies, setCopies] = useState(1);
  const [selectedServices, setSelectedServices] = useState<Record<string, number>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  useEffect(() => {
    api.get('/settings').then((res) => setSettings(res.data.settings));
    api.get('/services').then((res) => setServices(res.data.services));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const counts = await Promise.all(files.map(estimatePageCount));
      if (!cancelled) setEstimatedPages(counts.reduce((a, b) => a + b, 0));
    })();
    return () => {
      cancelled = true;
    };
  }, [files]);

  const bwService = services.find((s) => s.type === 'per_page_bw');
  const colorService = services.find((s) => s.type === 'per_page_color');
  const addOnServices = services.filter((s) => s.type === 'flat' || s.type === 'per_unit');
  const pricePerPage = (colorMode === 'bw' ? bwService?.price : colorService?.price) ?? 0;

  const printingPrice = estimatedPages * pricePerPage * copies;
  const chosenAddOns = addOnServices
    .filter((s) => selectedServices[s._id] > 0)
    .map((s) => ({ name: s.name, price: s.price, quantity: selectedServices[s._id] }));
  const servicesPrice = chosenAddOns.reduce((sum, s) => sum + s.price * s.quantity, 0);
  const estimatedTotal = printingPrice + servicesPrice;

  const maxFiles = settings?.maxFilesPerOrder ?? 10;
  const maxFileSizeMb = settings?.maxFileSizeMb ?? 20;
  const maxCopies = settings?.maxCopies ?? 20;

  const validateFilesStep = () => {
    if (files.length === 0) return 'Please upload at least one file.';
    const tooBig = files.find((f) => f.size > maxFileSizeMb * 1024 * 1024);
    if (tooBig) return `"${tooBig.name}" is too large. Maximum allowed size is ${maxFileSizeMb} MB.`;
    return '';
  };

  const goNext = () => {
    if (step === 0) {
      const err = validateFilesStep();
      setFileError(err);
      if (err) return;
    }
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleConfirm = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const formData = new FormData();
      formData.append('colorMode', colorMode);
      formData.append('sides', sides);
      formData.append('copies', String(copies));
      formData.append(
        'services',
        JSON.stringify(
          Object.entries(selectedServices)
            .filter(([, qty]) => qty > 0)
            .map(([serviceId, quantity]) => ({ serviceId, quantity }))
        )
      );
      files.forEach((f) => formData.append('files', f));

      const res = await api.post('/orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setConfirmedOrder(res.data.order);
      setStep(3);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAddOn = (id: string) => {
    setSelectedServices((prev) => ({ ...prev, [id]: prev[id] ? 0 : 1 }));
  };

  const setAddOnQty = (id: string, qty: number) => {
    setSelectedServices((prev) => ({ ...prev, [id]: Math.max(1, qty) }));
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="text-2xl font-semibold">New Printing Order</h1>

      {/* Progress indicator */}
      <div className="mt-5 flex items-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                i <= step ? 'bg-rose-500 text-white' : 'bg-blush-100 text-ink-400'
              }`}
            >
              {i + 1}
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-1 flex-1 rounded-full ${i < step ? 'bg-rose-400' : 'bg-blush-100'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Upload */}
      {step === 0 && (
        <div className="mt-8">
          <FileDropzone
            files={files}
            onChange={(f) => {
              setFiles(f);
              setFileError('');
            }}
            maxFileSizeMb={maxFileSizeMb}
            maxFiles={maxFiles}
            error={fileError}
          />
          <p className="mt-3 text-xs font-semibold text-ink-400">
            You can upload up to {maxFiles} files for this order.
          </p>
        </div>
      )}

      {/* Step 1: Options */}
      {step === 1 && (
        <div className="mt-8 flex flex-col gap-6">
          <div>
            <p className="mb-2 text-sm font-bold text-ink-600">Color</p>
            <div className="grid grid-cols-2 gap-3">
              {(['bw', 'color'] as ColorMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setColorMode(mode)}
                  className={`rounded-2xl border-2 px-4 py-3 text-sm font-bold transition ${
                    colorMode === mode
                      ? 'border-rose-400 bg-blush-50 text-rose-600'
                      : 'border-blush-100 bg-white text-ink-500'
                  }`}
                >
                  {mode === 'bw' ? 'Black & White' : 'Color'}
                  <span className="ml-1 font-semibold text-ink-400">
                    ({mode === 'bw' ? bwService?.price ?? '–' : colorService?.price ?? '–'} DA/page)
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-ink-600">Sides</p>
            <div className="grid grid-cols-2 gap-3">
              {(['single', 'double'] as Sides[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSides(s)}
                  className={`rounded-2xl border-2 px-4 py-3 text-sm font-bold transition ${
                    sides === s ? 'border-rose-400 bg-blush-50 text-rose-600' : 'border-blush-100 bg-white text-ink-500'
                  }`}
                >
                  {s === 'single' ? 'Single-sided' : 'Double-sided'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="copies" className="mb-2 block text-sm font-bold text-ink-600">
              Number of copies
            </label>
            <input
              id="copies"
              type="number"
              min={1}
              max={maxCopies}
              value={copies}
              onChange={(e) => setCopies(Math.min(maxCopies, Math.max(1, Number(e.target.value) || 1)))}
              className="w-28 rounded-2xl border border-blush-200 bg-cream px-4 py-3 text-sm font-bold text-ink-700 outline-none focus:border-rose-400"
            />
          </div>

          {addOnServices.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-bold text-ink-600">Optional services</p>
              <div className="flex flex-col gap-2">
                {addOnServices.map((service) => {
                  const active = !!selectedServices[service._id];
                  return (
                    <div
                      key={service._id}
                      className={`flex items-center justify-between rounded-2xl border-2 px-4 py-3 transition ${
                        active ? 'border-rose-400 bg-blush-50' : 'border-blush-100 bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleAddOn(service._id)}
                        className="flex-1 text-left text-sm font-bold text-ink-700"
                      >
                        {service.name}{' '}
                        <span className="font-semibold text-ink-400">
                          ({service.price} {service.unit})
                        </span>
                      </button>
                      {active && (
                        <input
                          type="number"
                          min={1}
                          value={selectedServices[service._id]}
                          onChange={(e) => setAddOnQty(service._id, Number(e.target.value) || 1)}
                          className="ml-3 w-16 rounded-xl border border-blush-200 bg-white px-2 py-1.5 text-center text-sm font-bold text-ink-700"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <PriceBreakdown
            totalPages={estimatedPages}
            colorMode={colorMode}
            pricePerPage={pricePerPage}
            copies={copies}
            printingPrice={printingPrice}
            services={chosenAddOns}
            totalPrice={estimatedTotal}
          />
          <p className="-mt-3 text-xs font-semibold text-ink-400">
            This is an estimate based on a quick page scan. The official total is confirmed after upload.
          </p>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <div className="mt-8 flex flex-col gap-5">
          <div className="rounded-3xl border border-blush-100 bg-white p-5">
            <h3 className="mb-3 font-display text-base font-semibold text-ink-700">Order summary</h3>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="font-semibold text-ink-400">Files</dt>
                <dd className="text-right font-bold text-ink-700">
                  {files.map((f) => f.name).join(', ')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-ink-400">Estimated pages</dt>
                <dd className="font-bold text-ink-700">{estimatedPages}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-ink-400">Printing</dt>
                <dd className="font-bold text-ink-700">{colorMode === 'bw' ? 'Black & White' : 'Color'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-ink-400">Sides</dt>
                <dd className="font-bold text-ink-700">{sides === 'single' ? 'Single-sided' : 'Double-sided'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-ink-400">Copies</dt>
                <dd className="font-bold text-ink-700">{copies}</dd>
              </div>
            </dl>
          </div>

          <PriceBreakdown
            totalPages={estimatedPages}
            colorMode={colorMode}
            pricePerPage={pricePerPage}
            copies={copies}
            printingPrice={printingPrice}
            services={chosenAddOns}
            totalPrice={estimatedTotal}
          />

          {submitError && (
            <p role="alert" className="rounded-xl bg-coral-100 px-3 py-2 text-sm font-bold text-coral-500">
              {submitError}
            </p>
          )}
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && confirmedOrder && (
        <div className="mt-10 flex flex-col items-center rounded-4xl border border-blush-100 bg-white p-10 text-center shadow-soft">
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-mint-100 text-mint-500">
            <PartyPopper size={28} />
          </span>
          <h2 className="font-display text-xl font-semibold text-ink-700">Order confirmed! 🎉</h2>
          <p className="mt-3 text-sm font-semibold text-ink-400">Your order number</p>
          <p className="font-display text-2xl font-semibold text-rose-500">{confirmedOrder.orderNumber}</p>
          <p className="mt-3 text-sm font-semibold text-ink-400">Total</p>
          <p className="font-display text-xl font-semibold text-ink-700">{confirmedOrder.totalPrice} DA</p>
          <p className="mt-4 text-sm font-semibold text-ink-500">
            We'll let you know when your order is ready to collect.
          </p>
          <button
            onClick={() => navigate(`/dashboard/orders/${confirmedOrder._id}`)}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-rose-500 px-7 py-3.5 text-sm font-bold text-white shadow-blush transition hover:-translate-y-0.5 hover:bg-rose-600"
          >
            View My Order
          </button>
        </div>
      )}

      {/* Navigation */}
      {step < 3 && (
        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-blush-200 bg-white px-5 py-3 text-sm font-bold text-ink-600 disabled:opacity-40"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {step < 2 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-6 py-3 text-sm font-bold text-white shadow-blush transition hover:-translate-y-0.5 hover:bg-rose-600"
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-bold text-white shadow-blush transition hover:-translate-y-0.5 hover:bg-rose-600 disabled:opacity-60"
            >
              {submitting && <Spinner className="h-4 w-4" />}
              Confirm Order
            </button>
          )}
        </div>
      )}
    </div>
  );
}
