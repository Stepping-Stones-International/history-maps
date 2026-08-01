class TopicsController < ApplicationController
  def index
    @topics = Topic.order(:title)
  end
end
