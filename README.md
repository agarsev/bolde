# BOLDE

### Borjes Online Linguistics Development Environment.

This is an prototype online IDE for computational linguistics, centered on
grammar development, as described in my [master thesis](https://garciasevilla.com/biblio/AFGSevilla_Masterthesis.pdf).
An online demo version is available [here](https://garciasevilla.com/bolde/).

BOLDE is meant as an academic work for demonstration, and probably would need a
lot of work for real use. I upload it here because there seems to be some
interest. While BOLDE is unsupported, I am available for some consultation and
especially in case there is interest for further or related development :)

## Install

The installation procedure is untested (because of "runs on my server" syndrome)
but, in theory, the following steps should work:

1. Run `make update` (see note below).
2. Run `make`.
3. Create user files folder.
4. Create logs folder
5. Copy `config/default.yml` to `config/local.yml` and customize.
6. Write `config/welcome.md`.
7. Put extra static assets in `static/`.
8. Launch with `npm start`.

**Note**: In step 1, you might have to install the packages for borjes and
borjes-react from the local directory `lib`.

## Related

1. [borjes](https://github.com/agarsev/borjes)
2. [borjes-react](https://github.com/agarsev/borjes-react)
