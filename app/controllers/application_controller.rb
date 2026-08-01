class ApplicationController < ActionController::Base
  include Authentication
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # Props every Inertia page can rely on.
  #
  # resume_session is called explicitly: pages that opt out of authentication
  # never run the before_action, so Current.user would otherwise be nil there
  # and the header would show a signed-in user as logged out.
  inertia_share do
    user = resume_session && Current.user

    {
      currentUser: user && { email_address: user.email_address },
      flash: { notice: flash[:notice], alert: flash[:alert] }.compact
    }
  end
end
