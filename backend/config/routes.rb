Rails.application.routes.draw do
  get 'current_user', to: 'current_user#index'
  devise_for :users, path: '', path_names: {
    sign_in: 'api/v1/login',
    sign_out: 'api/v1/logout',
    registration: 'api/v1/signup'
  },
  controllers: {
    sessions: 'api/v1/sessions',
    registrations: 'api/v1/registrations'
  }

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      resources :bars do
        collection do
          get 'search'
        end
        member do
          get :beers
          get :addresses
          get :countrys 
        end
      end

      resources :beers, only: [:index, :show, :create, :update, :destroy] do
        collection do
          get 'search'
        end
        member do
          get :bars
        end
        resources :reviews, only: [:index, :show, :create, :update, :destroy]
      end

      resources :brands, only: [:show]
      resources :events, only: [:index, :show, :create, :update, :destroy]

      resources :users do
        resources :reviews, only: [:index]
        member do
          get :friendships
          post :friendships, to: 'users#create_friendship'
        end
      end

      resources :reviews, only: [:index, :show, :create, :update, :destroy]
      resources :attendances
      # Nueva ruta para listar las asistencias de un evento (sin usar collection)
      get 'attendances/event/:event_id', to: 'attendances#index_by_event'
    end
  end
end
