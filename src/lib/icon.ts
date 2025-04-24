import Openai from '@/assets/providers/openai.png'
import Anthropic from '@/assets/providers/anthropic.png'

import GPT35 from '@/assets/models/gpt_3.5.png'
import GPT4 from '@/assets/models/gpt_4.png'
import O1Mini from '@/assets/models/gpt_o1.png'
import Claude from '@/assets/models/claude.png'

export function getLogoFromDirectory(directory: string) {
  const logoMap = {
    'openai': Openai,
    'anthropic': Anthropic,
    'gpt-3.5-turbo': GPT35,
    'gpt-4-turbo': GPT4,
    'gpt-4': GPT4,
    'gpt-4o': GPT4,
    'gpt-4o-mini': GPT4,
    'o1-mini': O1Mini,
    'o1-preview': O1Mini,
    'claude-3-5-sonnet': Claude,
    'claude-3-opus': Claude,
    'claude-3-haiku': Claude,
    'claude-3-5-haiku': Claude,
    'claude-3-sonnet': Claude,
  }

  return logoMap[directory as keyof typeof logoMap]
}
