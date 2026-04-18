import { ChestChoiceOption, ChestReward } from "./hooks/use_lobby";

type Translator = (key: string, params?: Record<string, string | number>) => string;

type CardReward = Pick<
  ChestReward,
  "card_key" | "card_mode" | "pending_schluecke" | "pending_shots" | "choice_options" | "selected_choice_key"
> & {
  affectedParticipantNames?: string[];
};

export function getCardTitle(t: Translator, cardKey: string) {
  return t(`distribute.cardTitle.${cardKey}`);
}

export function getCardDescription(t: Translator, reward: CardReward) {
  return formatCardText(t, reward, { includeResolvedAmount: true });
}

export function getCardRuleText(t: Translator, reward: CardReward) {
  return formatCardText(t, reward, { includeResolvedAmount: false });
}

function formatCardText(
  t: Translator,
  reward: CardReward,
  options: { includeResolvedAmount: boolean },
) {
  if (!reward.card_key || !reward.card_mode) {
    return "";
  }

  if (reward.card_mode === "effect_choice" && reward.selected_choice_key) {
    const selected = reward.choice_options?.find(
      (option) => option.key === reward.selected_choice_key,
    );
    if (selected) {
      const rule = getChoiceOptionDescription(t, reward.card_key, selected);
      if (!options.includeResolvedAmount || (selected.schluecke ?? 0) === 0 && (selected.shots ?? 0) === 0) {
        return rule;
      }

      return [
        rule,
        t("distribute.cardResolvedAmount", {
          amount: formatResolvedAmount(t, selected.schluecke, selected.shots),
        }),
      ].join("\n\n");
    }
  }

  const rule = t(`distribute.cardRule.${reward.card_key}`);

  if (!options.includeResolvedAmount) {
    return rule;
  }

  const sips = reward.pending_schluecke ?? 0;
  const shots = reward.pending_shots ?? 0;
  if (sips === 0 && shots === 0) {
    return rule;
  }

  return [
    rule,
    t("distribute.cardResolvedAmount", {
      amount: formatResolvedAmount(t, sips, shots),
    }),
  ].join("\n\n");
}

function formatResolvedAmount(t: Translator, sips: number, shots: number) {
  if (sips > 0 && shots > 0) {
    return `${sips} ${t("distribute.sipsShort")} + ${shots} ${t("distribute.shotsShort")}`;
  }

  if (shots > 0) {
    return `${shots} ${t("distribute.shotsShort")}`;
  }

  return `${sips} ${t("distribute.sipsShort")}`;
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
