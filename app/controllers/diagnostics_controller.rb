# TEMPORARY: records browser-side events in the Rails log while a save bug is
# tracked down. Remove together with the [NODE-SAVE] logging in NodesController.
class DiagnosticsController < ApplicationController
  allow_unauthenticated_access
  skip_forgery_protection

  def create
    Rails.logger.info("[CLIENT] #{request.raw_post}")
    head :no_content
  end
end
