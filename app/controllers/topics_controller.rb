class TopicsController < ApplicationController
  allow_unauthenticated_access only: :index

  def index
    render inertia: "Topics/Index", props: {
      topics: Topic.includes(:author).order(:title).map { |topic|
        {
          id: topic.id,
          title: topic.title,
          description: topic.description,
          author_email: topic.author.email_address
        }
      }
    }
  end

  def new
    render inertia: "Topics/New"
  end

  # The map view for a topic. Scoped to the signed-in user's own topics.
  def edit
    topic = Current.user.topics.find(params[:id])

    render inertia: "Topics/Edit", props: {
      topic: { id: topic.id, title: topic.title, description: topic.description }
    }
  end

  def create
    topic = Current.user.topics.new(topic_params)

    if topic.save
      redirect_to topics_path, notice: "Topic added."
    else
      redirect_to new_topic_path, inertia: { errors: topic.errors }
    end
  end

  private
    # Inertia forms post a flat payload.
    def topic_params
      params.permit(:title, :description)
    end
end
