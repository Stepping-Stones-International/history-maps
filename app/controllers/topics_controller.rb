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

  # The map view for a topic. Scoped to the signed-in user's own topics.
  def edit
    topic = Current.user.topics.find(params[:id])

    render inertia: "Topics/Edit", props: {
      topic: { id: topic.id, title: topic.title, description: topic.description },
      nodes: topic.nodes.order(:created_at).map { |node|
        {
          id: node.id,
          title: node.title,
          description: node.description,
          date_type: node.date_type,
          occurred_on: node.occurred_on_formatted,
          latitude: node.latitude,
          longitude: node.longitude
        }
      },
      # Sent from the model so the form cannot drift from the validation.
      dateTypes: Node::DATE_TYPES.map { |value, label| { value: value, label: label } }
    }
  end

  def create
    topic = Current.user.topics.new(topic_params)

    if topic.save
      redirect_to edit_topic_path(topic), notice: "Topic added."
    else
      # Back to the list, where the modal stays open and shows the errors.
      redirect_to topics_path, inertia: { errors: topic.errors }
    end
  end

  private
    # Inertia forms post a flat payload.
    def topic_params
      params.permit(:title, :description)
    end
end
