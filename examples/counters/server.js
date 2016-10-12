import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from './webpack.config.babel';
import Express from 'express';


const app = new Express();
const port = 11111;

const compiler = webpack(config);
app.use(webpackDevMiddleware(compiler, {
    noInfo: true, publicPath: config.output.publicPath
}));
app.use(webpackHotMiddleware(compiler));

app.use(function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, function (error) {
    if (error) {
        console.error(error);
    } else {
        console.info(
            'Server running on http://localhost:' + port
        );
    }
});
