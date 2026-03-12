"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from './LanguageContext';

interface LawyerAdProps {
  highlight?: boolean;
  imageSrc?: string;
}

const LawyerAd: React.FC<LawyerAdProps> = ({
  highlight = false,
  imageSrc = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/lawyer-ad-evan.jpg`,
}) => {
  const { t } = useLanguage();
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <section className={`overflow-hidden rounded-2xl border shadow-md ${highlight ? 'border-red-500 ring-4 ring-red-200' : 'border-gray-200'}`}>
      {!imageFailed ? (
        <div className="bg-white">
          <div className="border-b border-gray-200 bg-gradient-to-br from-red-600 via-red-500 to-yellow-500 p-4 text-white md:p-6">
            <div className="max-w-3xl">
              <div>
                <div className="text-sm font-extrabold leading-tight md:text-2xl">{t('lawyer_ad_title')}</div>
                <div className="mt-1 text-[11px] leading-relaxed text-red-50 md:text-sm">{t('lawyer_ad_subtitle')}</div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-black/72 p-3 text-white shadow-xl md:p-5">
              {highlight && (
                <div className="mb-3 inline-flex rounded-full bg-yellow-300 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-900 md:text-xs">
                  {t('lawyer_ad_risk_badge')}
                </div>
              )}

              {highlight && (
                <div className="mb-3 text-xs leading-relaxed text-yellow-100 md:text-sm">
                  {t('lawyer_ad_risk_hint')}
                </div>
              )}

              <div className="text-[11px] font-semibold leading-relaxed text-yellow-100 md:text-sm">
                {t('lawyer_ad_services_title')}：{t('lawyer_ad_service_1')} | {t('lawyer_ad_service_2')} | {t('lawyer_ad_service_3')}
              </div>

              <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-yellow-200">{t('lawyer_ad_hotline')}</div>
                  <div className="mt-1 text-xl font-black text-white md:text-4xl">(138) 101-14083</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-yellow-200 md:text-sm">{t('lawyer_ad_cta')}</div>
                </div>

                <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-yellow-100 md:text-xs">
                  {t('lawyer_ad_footer')}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black">
            <Image
              src={imageSrc}
              alt={t('lawyer_ad_image_alt')}
              width={1152}
              height={768}
              className="h-auto w-full object-cover"
              onError={() => setImageFailed(true)}
              unoptimized
            />
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 px-4 py-8 text-center text-sm text-gray-500">
          {t('lawyer_ad_image_missing')}
        </div>
      )}
    </section>
  );
};

export default LawyerAd;