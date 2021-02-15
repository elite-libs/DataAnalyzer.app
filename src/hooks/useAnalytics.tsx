/**
 * More reading for 2020+:
 * https://medium.com/@marco.baldessari/tracking-custom-events-with-google-analytics-in-202-58fbf128e7e9
 */

type CustomEventArgs = {
  category: AppEventCategory;
  action: AppEventAction;
  label?: string | number | null | any;
  value?: string | number | null | any;
  nonInteraction?: boolean;
  // transport?: any;
  // hitCallback: Function;
  // callbackTimeout: number;
};

export type AppEventCategory =
  | 'demoData.import'
  | 'parseData.json'
  | 'parseData.csv'
  | 'analysis.pre'
  | 'analysis.post'
  | 'analysis.results'
  | 'code.results'
  | 'explorer.view';

export type AppEventAction = 'success' | 'warn' | 'fail' | 'view' | 'click' | 'exit' | 'analysis';

export function useAnalytics() {
  /**
   * This allows the user to create custom events within their Gatsby projects.
   *
   * @param {import('gatsby-plugin-google-analytics').CustomEventArgs} args
   * @see https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#events
   */
  return { trackCustomEvent };
}

export function trackCustomEvent({
  category,
  action,
  label,
  value = undefined,
  nonInteraction = false,
}: // transport = undefined,
CustomEventArgs) {
  // @ts-ignore
  if (window != null && window.gtag != null) {
    const trackingEventOptions = {
      event_category: category,
      // event_action: action,
      event_label: label,
      event_value: value,
      non_interaction: nonInteraction,
      // transport,
    };

    // if (!validateGoogleAnalyticsEvent(trackingEventOptions)) {
    //   console.error("WARNING: Analytics data invalid, may be truncated.", trackingEventOptions);
    // }

    // if (hitCallback && typeof hitCallback === `function`) {
    //   trackingEventOptions.hitCallback = () => setTimeout(hitCallback, callbackTimeout);
    // }
    // @ts-ignore
    window.gtag(`event`, action, trackingEventOptions);
  } else {
    console.warn('Stats could not be recorded.');
  }
}
