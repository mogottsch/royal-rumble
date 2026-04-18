import { ChestChoiceOption, ChestReward } from "./hooks/use_lobby";

type Translator = (key: string, params?: Record<string, string | number>) => string;

export function getCardTitle(t: Translator, cardKey: string) {
  return t(`distribute.cardTitle.${cardKey}`);
}

export function getCardDescription(
  t: Translator,
  reward: Pick<ChestReward, "card_key" | "card_mode" | "pending_schluecke" | "pending_shots" | "choice_options" | "selected_choice_key">,
) {
  if (!reward.card_key || !reward.card_mode) {
    return "";
  }

  if (reward.card_mode === "effect_choice" && reward.selected_choice_key) {
    const selected = reward.choice_options?.find(
      (option) => option.key === reward.selected_choice_key,
    );
    if (selected) {
      return getChoiceOptionDescription(t, reward.card_key, selected);
    }
  }

  return t(`distribute.cardDescription.${reward.card_key}`, {
    sips: reward.pending_schluecke,
    shots: reward.pending_shots,
  });
}

export function getChoiceOptionTitle(
  t: Translator,
  cardKey: string,
  option: Pick<ChestChoiceOption, "key">,
) {
  return t(`distribute.choiceTitle.${cardKey}.${option.key}`);
}

export function getChoiceOptionDescription(
  t: Translator,
  cardKey: string,
  option: ChestChoiceOption,
) {
  return t(`distribute.choiceDescription.${cardKey}.${option.key}`, {
    sips: option.schluecke,
    shots: option.shots,
    selfSips: option.self_schluecke ?? 0,
    selfShots: option.self_shots ?? 0,
    minimumSelfSips: option.minimum_self_schluecke ?? 0,
    minimumSelfShots: option.minimum_self_shots ?? 0,
  });
}
