FROM ruby:3.0

WORKDIR /app

COPY src/Gemfile src/Gemfile.lock ./

RUN gem install bundler && bundle install

COPY src/ ./

EXPOSE 4000

CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0"]