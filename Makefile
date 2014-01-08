NPM=npm
GIT=git
JSCOVERAGE=jscoverage

all: npm js

cov:
				type $(JSCOVERAGE) > /dev/null 2>&1 || { echo >&2 "Please install jscoverage (brew install jscoverage)"; exit 1; }
				$(JSCOVERAGE) --no-highlight --no-instrument=test lib lib-cov
				mocha -R html-cov lib-cov/test/*.js > cov.html
				rm -rf lib-cov
				open cov.html

npm:
				$(NPM) install

test:
				mocha -R spec lib/test/*.js
