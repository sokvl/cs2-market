# CS2Market
### Counter-Strike 2 Items trading platform
Online platform allowing Counter Strike 2 players to trade their
digital goods. Application enables users to login through Steam,
sell and buy items listed by other platform users. The application
provides a digital wallet that can be topped up using a card
thanks to integration with Stripe. Additionally, users can use
advanced search queries and generate database reports. All is
integrated with external API providing detailed user and item
data.


## Feautures

- Logging in with Steam account.
- Listing items from dynamically downloaded user inventory with detailed item data collected from an external API.
- Digital wallet that can be topped up with a card thanks to Stripe integration.
- Digital funds allow users to buy items from vendors.
- Account management - users are permitted to manage their listings and edit their trade link.
- Notification system - users are notified when one of their items has been sold. The notification contains necessary instructions for order shipment.
- Advanced offer filtering allowing users to find items precisely suited to their needs.
- Report generation - website managers are allowed to generate reports of user ratings and transactions in order to analyze the performance of their business model.

## Technologies used


| Python | Django | Django REST Framework | JWT | Stripe | JavaScript | React | TailwindCSS |
|--------|--------|------------------------|-----|--------|------------|-------|-------------|
| ![Python](https://www.python.org/static/community_logos/python-logo.png) | ![Django](https://static.djangoproject.com/img/logos/django-logo-positive.png) | ![Django REST Framework](https://www.django-rest-framework.org/img/logo.png) | ![JWT](https://jwt.io/img/pic_logo.svg) | ![Stripe](https://stripe.com/img/v3/home/twitter.png) | ![JavaScript](https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png) | ![React](https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg) | ![TailwindCSS](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Tailwind_CSS_Logo.svg/1200px-Tailwind_CSS_Logo.svg.png) |

## Running locally

Configure .env file using steamwebapi and stripe api.
Then in main repository folder.
```sh
docker compose up
```
Finally, authorize using link in stripe container.
