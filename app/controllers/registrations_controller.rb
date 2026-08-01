class RegistrationsController < ApplicationController
  allow_unauthenticated_access

  def new
    render inertia: "Registrations/New"
  end

  def create
    user = User.new(user_params)

    if user.save
      start_new_session_for user
      redirect_to after_authentication_url, notice: "Welcome to Knowledge."
    else
      redirect_to new_registration_path, inertia: { errors: user.errors }
    end
  end

  private
    # Inertia forms post a flat payload, matching the generated SessionsController.
    def user_params
      params.permit(:email_address, :password, :password_confirmation)
    end
end
