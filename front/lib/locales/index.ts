/**
 * Locales
 */

import { I18n } from 'i18n-js'

import Arabic from '@/lib/locales/ar'
import English from '@/lib/locales/en'
import Turkish from '@/lib/locales/tr'
import Japanese from '@/lib/locales/ja'
import Spanish from '@/lib/locales/es'
import Swahili from '@/lib/locales/sw'

const Locales = new I18n({
  ar: Arabic,
  en: English,
  tr: Turkish,
  ja: Japanese,
  es: Spanish,
  sw: Swahili,
})

Locales.enableFallback = true

export { Locales }
