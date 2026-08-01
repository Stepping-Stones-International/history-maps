class HomeController < ApplicationController
  allow_unauthenticated_access

  def index
    render inertia: "Home/Index"
  end
end
