package com.rork.learndariandroid.ui.navigation

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.net.toUri
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.rork.learndariandroid.AppGraph
import com.rork.learndariandroid.R
import com.rork.learndariandroid.data.LearnUnit
import com.rork.learndariandroid.data.Lesson
import com.rork.learndariandroid.data.pathCorpus
import com.rork.learndariandroid.data.proverbOfTheDay
import com.rork.learndariandroid.data.searchCorpus
import com.rork.learndariandroid.data.wordOfTheDay
import com.rork.learndariandroid.domain.LessonSession
import com.rork.learndariandroid.ui.screens.CultureScreen
import com.rork.learndariandroid.ui.screens.ExploreScreen
import com.rork.learndariandroid.ui.screens.FlashcardsScreen
import com.rork.learndariandroid.ui.screens.LearnScreen
import com.rork.learndariandroid.ui.screens.LessonScreen
import com.rork.learndariandroid.ui.screens.LessonSessionScreen
import com.rork.learndariandroid.ui.screens.LessonSessionViewModel
import com.rork.learndariandroid.ui.screens.ProfileScreen
import com.rork.learndariandroid.ui.screens.ProverbsScreen
import com.rork.learndariandroid.ui.screens.QuizScreen
import com.rork.learndariandroid.ui.screens.TraditionsScreen
import com.rork.learndariandroid.ui.screens.UnitGuidebook
import com.rork.learndariandroid.ui.screens.VocabScreen
import com.rork.learndariandroid.ui.screens.VocabSetScreen
import com.rork.learndariandroid.ui.screens.WordOfTheDayScreen
import com.rork.learndariandroid.ui.theme.Brand
import kotlinx.coroutines.launch

private const val ROUTE_LEARN = "learn"
private const val ROUTE_VOCAB = "vocab"
private const val ROUTE_EXPLORE = "explore"
private const val ROUTE_CULTURE = "culture"
private const val ROUTE_PROFILE = "profile"

private data class Tab(val route: String, val label: String, val icon: ImageVector)

private val tabs = listOf(
    Tab(ROUTE_LEARN, "Learn", Icons.Filled.School),
    Tab(ROUTE_VOCAB, "Vocab", Icons.AutoMirrored.Filled.MenuBook),
    Tab(ROUTE_EXPLORE, "Explore", Icons.Filled.Search),
    Tab(ROUTE_CULTURE, "Culture", Icons.Filled.Public),
    Tab(ROUTE_PROFILE, "Profile", Icons.Filled.Person),
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    val content = AppGraph.content
    val progress = AppGraph.progress
    val audio = AppGraph.audio

    val document by content.document.collectAsStateWithLifecycle()
    val progressState by progress.state.collectAsStateWithLifecycle()

    // Keep the path in step with whatever the Studio has published.
    androidx.compose.runtime.LaunchedEffect(document) {
        progress.setUnits(document.units)
    }
    androidx.compose.runtime.LaunchedEffect(Unit) {
        content.refresh(scope)
    }
    androidx.compose.runtime.LaunchedEffect(progressState.soundEnabled) {
        audio.isSoundEnabled = progressState.soundEnabled
    }

    val onPlay: (String, String?) -> Unit = { text, key -> audio.speak(text, key) }

    val snackbarHostState = remember { SnackbarHostState() }
    var guidebookUnit by remember { mutableStateOf<LearnUnit?>(null) }
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route
    val isTabRoute = tabs.any { it.route == currentRoute }

    Scaffold(
        containerColor = Color.White,
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            if (isTabRoute) {
                TopAppBar(
                    title = { Wordmark() },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White),
                )
            }
        },
        bottomBar = {
            if (isTabRoute) {
                NavigationBar(containerColor = Color.White, tonalElevation = 0.dp) {
                    tabs.forEach { tab ->
                        NavigationBarItem(
                            selected = currentRoute == tab.route,
                            onClick = {
                                if (currentRoute == tab.route) return@NavigationBarItem
                                navController.navigate(tab.route) {
                                    popUpTo(ROUTE_LEARN) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(tab.icon, contentDescription = tab.label) },
                            label = { Text(tab.label, fontSize = 11.sp) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = Brand.Red,
                                selectedTextColor = Brand.Red,
                                indicatorColor = Brand.RedSoft,
                                unselectedIconColor = Brand.MutedInk,
                                unselectedTextColor = Brand.MutedInk,
                            ),
                        )
                    }
                }
            }
        },
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = ROUTE_LEARN,
            modifier = Modifier.padding(padding),
        ) {
            composable(ROUTE_LEARN) {
                LearnScreen(
                    units = document.units,
                    stateFor = progress::stateFor,
                    streak = progressState.streak,
                    xp = progressState.xp,
                    wordsLearned = progress.wordsLearned,
                    completedCount = progress.completedLessonCount,
                    totalCount = progress.totalLessonCount,
                    onLesson = { navController.navigate("lesson/${it.id}") },
                    onUnitReview = { navController.navigate("unitReview/${it.id}") },
                    onGuidebook = { guidebookUnit = it },
                    onLocked = { message ->
                        scope.launch { snackbarHostState.showSnackbar(message) }
                    },
                )
            }

            composable(ROUTE_VOCAB) {
                VocabScreen(
                    sets = document.vocabSets,
                    onPlay = onPlay,
                    onOpenSet = { navController.navigate("vocabSet/${it.id}") },
                )
            }

            composable(ROUTE_EXPLORE) {
                ExploreScreen(
                    corpus = document.searchCorpus(),
                    popularWords = document.popularWords,
                    wordOfTheDay = document.wordOfTheDay(),
                    onPlay = onPlay,
                )
            }

            composable(ROUTE_CULTURE) {
                CultureScreen(
                    proverbOfTheDay = document.proverbOfTheDay(),
                    onPlay = onPlay,
                    onProverbs = { navController.navigate("proverbs") },
                    onTraditions = { navController.navigate("traditions") },
                    onWordOfTheDay = { navController.navigate("wordOfTheDay") },
                )
            }

            composable(ROUTE_PROFILE) {
                ProfileScreen(
                    state = progressState,
                    progress = progress,
                    nextLessonTitle = progress.currentLesson()?.title,
                    onOpenSupport = {
                        runCatching {
                            context.startActivity(
                                android.content.Intent(
                                    android.content.Intent.ACTION_VIEW,
                                    "https://learndari.com".toUri(),
                                ),
                            )
                        }
                    },
                )
            }

            // MARK: - Lesson flow

            composable(
                route = "lesson/{lessonId}",
                arguments = listOf(navArgument("lessonId") { type = NavType.StringType }),
            ) { entry ->
                val lessonId = entry.arguments?.getString("lessonId").orEmpty()
                val lesson = progress.lessonById(lessonId)

                DetailScaffold(
                    title = lesson?.title ?: "Lesson",
                    onBack = { navController.popBackStack() },
                ) { inner ->
                    if (lesson == null) {
                        MissingContent(inner)
                    } else {
                        LessonScreen(
                            lesson = lesson,
                            onPlay = onPlay,
                            onStartPractice = { navController.navigate("session/${lesson.id}") },
                            onFlashcards = { navController.navigate("lessonCards/${lesson.id}") },
                            modifier = Modifier.padding(inner),
                        )
                    }
                }
            }

            composable(
                route = "session/{lessonId}",
                arguments = listOf(navArgument("lessonId") { type = NavType.StringType }),
            ) { entry ->
                val lessonId = entry.arguments?.getString("lessonId").orEmpty()
                val lesson = progress.lessonById(lessonId)

                if (lesson == null) {
                    DetailScaffold("Practice", { navController.popBackStack() }) { MissingContent(it) }
                    return@composable
                }

                val milestoneWords = remember(lessonId, document) {
                    progress.unitContaining(lessonId)?.lessons?.flatMap { it.words } ?: lesson.words
                }
                val corpus = remember(document) { document.pathCorpus() }

                val viewModel: LessonSessionViewModel = viewModel(
                    key = "session-$lessonId",
                    factory = viewModelFactory {
                        initializer {
                            LessonSessionViewModel(
                                LessonSession(lesson, milestoneWords, corpus, progress),
                            )
                        }
                    },
                )
                val sessionState by viewModel.state.collectAsStateWithLifecycle()

                DetailScaffold(
                    title = lesson.title,
                    onBack = { navController.popBackStack() },
                    backIcon = Icons.Filled.Close,
                ) { inner ->
                    LessonSessionScreen(
                        state = sessionState,
                        lessonSubtitle = lesson.subtitle,
                        streak = progressState.streak,
                        onPlay = onPlay,
                        onAnswer = viewModel::submit,
                        onMatchComplete = viewModel::submitMatch,
                        onDone = {
                            finishLesson(lesson, progress)
                            navController.popBackStack(ROUTE_LEARN, inclusive = false)
                        },
                        modifier = Modifier.padding(inner),
                    )
                }
            }

            composable(
                route = "lessonCards/{lessonId}",
                arguments = listOf(navArgument("lessonId") { type = NavType.StringType }),
            ) { entry ->
                val lessonId = entry.arguments?.getString("lessonId").orEmpty()
                val lesson = progress.lessonById(lessonId)
                DetailScaffold(
                    title = lesson?.title ?: "Flashcards",
                    onBack = { navController.popBackStack() },
                ) { inner ->
                    FlashcardsScreen(
                        words = lesson?.words.orEmpty(),
                        onPlay = onPlay,
                        modifier = Modifier.padding(inner),
                    )
                }
            }

            composable(
                route = "unitReview/{unitId}",
                arguments = listOf(navArgument("unitId") { type = NavType.StringType }),
            ) { entry ->
                val unitId = entry.arguments?.getString("unitId").orEmpty()
                val unit = document.units.firstOrNull { it.id == unitId }
                DetailScaffold(
                    title = "${unit?.title ?: "Unit"} review",
                    onBack = { navController.popBackStack() },
                    backIcon = Icons.Filled.Close,
                ) { inner ->
                    QuizScreen(
                        words = unit?.lessons?.flatMap { it.words }.orEmpty(),
                        progress = progress,
                        onPlay = onPlay,
                        onDone = { navController.popBackStack() },
                        modifier = Modifier.padding(inner),
                    )
                }
            }

            // MARK: - Vocab flow

            composable(
                route = "vocabSet/{setId}",
                arguments = listOf(navArgument("setId") { type = NavType.StringType }),
            ) { entry ->
                val setId = entry.arguments?.getString("setId").orEmpty()
                val set = document.vocabSets.firstOrNull { it.id == setId }
                DetailScaffold(
                    title = set?.name ?: "Vocabulary",
                    onBack = { navController.popBackStack() },
                ) { inner ->
                    if (set == null) {
                        MissingContent(inner)
                    } else {
                        VocabSetScreen(
                            set = set,
                            onPlay = onPlay,
                            onFlashcards = { navController.navigate("setCards/${set.id}") },
                            onQuiz = { navController.navigate("setQuiz/${set.id}") },
                            modifier = Modifier.padding(inner),
                        )
                    }
                }
            }

            composable(
                route = "setCards/{setId}",
                arguments = listOf(navArgument("setId") { type = NavType.StringType }),
            ) { entry ->
                val setId = entry.arguments?.getString("setId").orEmpty()
                val set = document.vocabSets.firstOrNull { it.id == setId }
                DetailScaffold(
                    title = set?.name ?: "Flashcards",
                    onBack = { navController.popBackStack() },
                ) { inner ->
                    FlashcardsScreen(
                        words = set?.words.orEmpty(),
                        onPlay = onPlay,
                        modifier = Modifier.padding(inner),
                    )
                }
            }

            composable(
                route = "setQuiz/{setId}",
                arguments = listOf(navArgument("setId") { type = NavType.StringType }),
            ) { entry ->
                val setId = entry.arguments?.getString("setId").orEmpty()
                val set = document.vocabSets.firstOrNull { it.id == setId }
                DetailScaffold(
                    title = set?.name ?: "Quiz",
                    onBack = { navController.popBackStack() },
                    backIcon = Icons.Filled.Close,
                ) { inner ->
                    QuizScreen(
                        words = set?.words.orEmpty(),
                        progress = progress,
                        onPlay = onPlay,
                        onDone = { navController.popBackStack() },
                        modifier = Modifier.padding(inner),
                    )
                }
            }

            // MARK: - Culture flow

            composable("proverbs") {
                DetailScaffold("Afghan Proverbs", { navController.popBackStack() }) { inner ->
                    ProverbsScreen(
                        proverbs = document.proverbs,
                        onPlay = onPlay,
                        modifier = Modifier.padding(inner),
                    )
                }
            }

            composable("traditions") {
                DetailScaffold("Culture & Traditions", { navController.popBackStack() }) { inner ->
                    TraditionsScreen(modifier = Modifier.padding(inner))
                }
            }

            composable("wordOfTheDay") {
                DetailScaffold("Word of the Day", { navController.popBackStack() }) { inner ->
                    WordOfTheDayScreen(
                        word = document.wordOfTheDay(),
                        onPlay = onPlay,
                        modifier = Modifier.padding(inner),
                    )
                }
            }
        }
    }

    val unit = guidebookUnit
    if (unit != null) {
        ModalBottomSheet(
            onDismissRequest = { guidebookUnit = null },
            sheetState = sheetState,
            containerColor = Color.White,
        ) {
            Text(
                text = unit.title,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Brand.Ink,
                modifier = Modifier.padding(start = 16.dp, end = 16.dp, bottom = 4.dp),
            )
            UnitGuidebook(unit = unit, stateFor = progress::stateFor)
        }
    }
}

/** Marks the lesson complete and awards the one-off bonus for a first pass. */
private fun finishLesson(lesson: Lesson, progress: com.rork.learndariandroid.data.ProgressStore) {
    val isNewCompletion = !progress.state.value.completedLessonIds.contains(lesson.id)
    progress.completeLesson(lesson)
    if (isNewCompletion) progress.award(com.rork.learndariandroid.data.Award.LessonComplete)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DetailScaffold(
    title: String,
    onBack: () -> Unit,
    backIcon: ImageVector = Icons.AutoMirrored.Filled.ArrowBack,
    content: @Composable (androidx.compose.foundation.layout.PaddingValues) -> Unit,
) {
    Scaffold(
        containerColor = Color.White,
        topBar = {
            TopAppBar(
                title = {
                    Text(title, fontSize = 18.sp, fontWeight = FontWeight.SemiBold, color = Brand.Ink)
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(backIcon, contentDescription = "Back", tint = Brand.Red)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White),
            )
        },
        content = content,
    )
}

@Composable
private fun MissingContent(padding: androidx.compose.foundation.layout.PaddingValues) {
    Text(
        text = "That content isn't available yet.",
        color = Brand.SecondaryInk,
        modifier = Modifier.padding(padding).padding(24.dp),
    )
}

/** The LearnDari lockup shown in every tab's app bar. */
@Composable
private fun Wordmark() {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Image(
            painter = painterResource(R.drawable.learndari_mark),
            contentDescription = "LearnDari",
            modifier = Modifier.size(30.dp),
        )
        Text(
            text = "LearnDari",
            fontSize = 19.sp,
            fontWeight = FontWeight.Bold,
            color = Brand.Ink,
        )
    }
}

/** Kept so the nav host can be previewed without the full graph. */
@Suppress("unused")
private fun unusedController(controller: NavHostController): String = controller.toString()
