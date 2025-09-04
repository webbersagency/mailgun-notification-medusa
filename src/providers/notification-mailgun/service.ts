import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"
import formData from "form-data"
import {render} from "@react-email/components"
import {ReactElement} from "react"

type InjectedDependencies = {
  logger: Logger
}

export type TemplateFn<Props> = (props: Props) => ReactElement

type TemplateConfig<S = (locale: string) => string, P = any> = {
  subject: S
  template: TemplateFn<P>
}

type Options = {
  apiKey: string
  domain: string
  from_email: string
  templates: Record<string, TemplateConfig>
  default_locale: string
  // Only required if using Mailgun's EU-hosted infrastructure
  api_url?: string
}

class MailgunNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "notification-mailgun"

  protected logger_: Logger
  protected options_: Options
  protected client_

  constructor({logger}: InjectedDependencies, options: Options) {
    super()

    this.logger_ = logger
    this.options_ = options
  }

  static validateOptions(options: Options) {
    if (!options.apiKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Mailgun API key is required`
      )
    }
    if (!options.domain) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Mailgun domain is required`
      )
    }
    if (!options.from_email) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Mailgun from_email is required`
      )
    }
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    await this.initializeClient()
    const templateConfig = this.options_?.templates?.[notification.template]

    if (!templateConfig) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Template ${notification.template} not found`
      )
    }

    // @ts-ignore
    const renderedTemplate = await render(
      templateConfig.template(notification.data)
    )

    const subject = templateConfig.subject(
      (notification?.data?.locale as string) ?? this.options_.default_locale
    )

    try {
      return this.client_.messages.create(this.options_.domain, {
        from: notification.from?.trim() || this.options_.from_email?.trim(),
        subject,
        to: notification.to,
        html: renderedTemplate,
        attachments: notification.attachments ?? undefined,
      })
    } catch (e) {
      console.log(e, "error")
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Error sending email with template ${notification.template}, to ${notification.to}: ${JSON.stringify(e)}`
      )
    }
  }

  private async initializeClient() {
    const Mailgun = (await import("mailgun.js")).default
    const mailgun = new Mailgun(formData)
    this.client_ = mailgun.client({
      username: "api",
      key: this.options_.apiKey,
      ...(this.options_.api_url && {url: this.options_.api_url}),
    })
  }
}

export default MailgunNotificationProviderService
