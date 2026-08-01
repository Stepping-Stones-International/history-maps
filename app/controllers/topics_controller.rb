class TopicsController < ApplicationController
  allow_unauthenticated_access only: :index

  def index
    @topics = Topic.includes(:author).order(:title)
  end

  def new
    @topic = Current.user.topics.new
  end

  def create
    @topic = Current.user.topics.new(topic_params)

    if @topic.save
      redirect_to topics_path, notice: "Topic added."
    else
      render :new, status: :unprocessable_entity
    end
  end

  private
    def topic_params
      params.expect(topic: [ :title, :description ])
    end
end
