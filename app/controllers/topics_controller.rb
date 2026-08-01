class TopicsController < ApplicationController
  allow_unauthenticated_access only: :index

  def index
    @topics = Topic.includes(:author).order(:title)
  end
end
