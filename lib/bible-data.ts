
/**
 * Enhanced Bible Verse Content
 * Comprehensive verse translations for all configured versions
 * Updated: September 1, 2025
 */

import { BIBLE_VERSIONS } from './bible-config'

// Enhanced Bible data with authentic translations
export const ENHANCED_BIBLE_DATA: { [key: string]: { [version: string]: string } } = {
  'Juan 3:16': {
    // ESPAÑOL
    'RVR1960': 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.',
    'RVC': 'Porque de tal manera amó Dios al mundo, que dio a su Hijo unigénito, para que todo aquel que en él cree no se pierda, sino que tenga vida eterna.',
    'TLA': 'Dios amó tanto a la gente del mundo, que me entregó a mí, que soy su único Hijo, para que todo el que crea en mí no muera, sino que tenga vida eterna.',
    'PDT': 'Dios amó tanto al mundo que dio a su único Hijo para que todo el que crea en él no perezca sino que tenga vida eterna.',
    'NVI': 'Tanto amó Dios al mundo que dio a su Hijo unigénito, para que todo el que cree en él no se pierda, sino que tenga vida eterna.',
    'NTV': 'Pues Dios amó tanto al mundo que dio a su único Hijo, para que todo el que crea en él no perezca, sino que tenga vida eterna.',
    'NBLA': 'Porque de tal manera amó Dios al mundo, que dio a Su Hijo unigénito, para que todo aquel que cree en El, no se pierda, sino que tenga vida eterna.',
    'VBL': 'Porque Dios amó tanto al mundo que dio a su Hijo único, para que todo el que crea en él no perezca, sino que tenga vida eterna.',
    'BAEC': 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito [único en su género], para que todo aquel que en él cree [que se adhiere a él, confía en él y descansa en él] no se pierda, mas tenga vida eterna.',
    
    // ENGLISH
    'ESV': 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
    'KJV': 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
    'TPT': 'For this is how much God loved the world—he gave his one and only, unique Son as a gift. So now everyone who believes in him will never perish but experience everlasting life.',
    'NLT': 'For this is how God loved the world: He gave his one and only Son, so that everyone who believes in him will not perish but have eternal life.',
    'AMPC': 'For God so [greatly] loved and dearly prized the world, that He [even] gave His [One and] only begotten Son, so that whoever believes and trusts in Him [as Savior] shall not perish, but have eternal life.',
    'GNT': 'For God loved the world so much that he gave his only Son, so that everyone who believes in him may not die but have eternal life.',
    'MEV': 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish, but have eternal life.',
    'MSG': 'This is how much God loved the world: He gave his Son, his one and only Son. And this is why: so that no one need be destroyed; by believing in him, anyone can have a whole and lasting life.',
    'MIRROR': 'In this God-kind-of-love is expressed the very heart and essence of the Eternal One who so treasured the world that he gave his uniquely born Son, so that everyone who believes into him would not perish but have everlasting life.'
  },

  'John 3:16': {
    // ENGLISH
    'ESV': 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
    'KJV': 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
    'TPT': 'For this is how much God loved the world—he gave his one and only, unique Son as a gift. So now everyone who believes in him will never perish but experience everlasting life.',
    'NLT': 'For this is how God loved the world: He gave his one and only Son, so that everyone who believes in him will not perish but have eternal life.',
    'AMPC': 'For God so [greatly] loved and dearly prized the world, that He [even] gave His [One and] only begotten Son, so that whoever believes and trusts in Him [as Savior] shall not perish, but have eternal life.',
    'GNT': 'For God loved the world so much that he gave his only Son, so that everyone who believes in him may not die but have eternal life.',
    'MEV': 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish, but have eternal life.',
    'MSG': 'This is how much God loved the world: He gave his Son, his one and only Son. And this is why: so that no one need be destroyed; by believing in him, anyone can have a whole and lasting life.',
    'MIRROR': 'In this God-kind-of-love is expressed the very heart and essence of the Eternal One who so treasured the world that he gave his uniquely born Son, so that everyone who believes into him would not perish but have everlasting life.'
  },

  'Salmos 23:1': {
    // ESPAÑOL
    'RVR1960': 'Jehová es mi pastor; nada me faltará.',
    'RVC': 'El Señor es mi pastor; nada me falta.',
    'TLA': 'El Señor es mi pastor; nada me falta.',
    'PDT': 'El Señor es mi pastor; no me falta nada.',
    'NVI': 'El Señor es mi pastor, nada me falta.',
    'NTV': 'El Señor es mi pastor; tengo todo lo que necesito.',
    'NBLA': 'El Señor es mi pastor, nada me faltará.',
    'VBL': 'Jehová es mi pastor; no me faltará nada.',
    'BAEC': 'Jehová [es] mi pastor; nada me faltará.',
    
    // ENGLISH
    'ESV': 'The Lord is my shepherd; I shall not want.',
    'KJV': 'The Lord is my shepherd; I shall not want.',
    'TPT': 'The Lord is my best friend and my shepherd. I always have more than enough.',
    'NLT': 'The Lord is my shepherd; I have all that I need.',
    'AMPC': 'The Lord is my Shepherd [to feed, guide, and shield me], I shall not lack.',
    'GNT': 'The Lord is my shepherd; I have everything I need.',
    'MEV': 'The Lord is my shepherd; I shall not want.',
    'MSG': 'God, my shepherd! I don\'t need a thing.',
    'MIRROR': 'Yahweh is my shepherd; I shall not want.'
  },

  'Psalm 23:1': {
    // ENGLISH
    'ESV': 'The Lord is my shepherd; I shall not want.',
    'KJV': 'The Lord is my shepherd; I shall not want.',
    'TPT': 'The Lord is my best friend and my shepherd. I always have more than enough.',
    'NLT': 'The Lord is my shepherd; I have all that I need.',
    'AMPC': 'The Lord is my Shepherd [to feed, guide, and shield me], I shall not lack.',
    'GNT': 'The Lord is my shepherd; I have everything I need.',
    'MEV': 'The Lord is my shepherd; I shall not want.',
    'MSG': 'God, my shepherd! I don\'t need a thing.',
    'MIRROR': 'Yahweh is my shepherd; I shall not want.'
  },

  'Romanos 8:28': {
    // ESPAÑOL
    'RVR1960': 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.',
    'RVC': 'Sabemos que Dios hace que todas las cosas ayuden para bien a los que lo aman, es decir, a los que él ha llamado de acuerdo con su propósito.',
    'TLA': 'Sabemos que Dios hace que todo lo que nos pasa nos ayude para nuestro bien, si lo amamos y si hacemos lo que él quiere.',
    'PDT': 'Sabemos que Dios hace que todas las cosas ayuden para el bien de los que lo aman, los que él ha llamado según su propósito.',
    'NVI': 'Ahora bien, sabemos que Dios dispone todas las cosas para el bien de quienes lo aman, los que han sido llamados de acuerdo con su propósito.',
    'NTV': 'Y sabemos que Dios hace que todas las cosas cooperen para el bien de quienes lo aman y son llamados según el propósito que él tiene para ellos.',
    'NBLA': 'Y sabemos que para los que aman a Dios, todas las cosas cooperan para bien, esto es, para los que son llamados conforme a Su propósito.',
    'VBL': 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.',
    'BAEC': 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien [están trabajando juntas para su bien], esto es, a los que conforme a su propósito son llamados.',
    
    // ENGLISH
    'ESV': 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.',
    'KJV': 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
    'TPT': 'So we are convinced that every detail of our lives is continually woven together to fit into God\'s perfect plan of bringing good into our lives, for we are his lovers who have been called to fulfill his designed purpose.',
    'NLT': 'And we know that God causes everything to work together for the good of those who love God and are called according to his purpose for them.',
    'AMPC': 'We are assured and know that [God being a partner in their labor] all things work together and are [fitting into a plan] for good to and for those who love God and are called according to [His] design and purpose.',
    'GNT': 'We know that in all things God works for good with those who love him, those whom he has called according to his purpose.',
    'MEV': 'We know that all things work together for good to those who love God, to those who are called according to His purpose.',
    'MSG': 'That\'s why we can be so sure that every detail in our lives of love for God is worked into something good.',
    'MIRROR': 'We are also aware that God causes all things to contribute to the advantage of those who love him; these are the ones who are called according to his predetermined purpose.'
  },

  'Romans 8:28': {
    // ENGLISH
    'ESV': 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.',
    'KJV': 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
    'TPT': 'So we are convinced that every detail of our lives is continually woven together to fit into God\'s perfect plan of bringing good into our lives, for we are his lovers who have been called to fulfill his designed purpose.',
    'NLT': 'And we know that God causes everything to work together for the good of those who love God and are called according to his purpose for them.',
    'AMPC': 'We are assured and know that [God being a partner in their labor] all things work together and are [fitting into a plan] for good to and for those who love God and are called according to [His] design and purpose.',
    'GNT': 'We know that in all things God works for good with those who love him, those whom he has called according to his purpose.',
    'MEV': 'We know that all things work together for good to those who love God, to those who are called according to His purpose.',
    'MSG': 'That\'s why we can be so sure that every detail in our lives of love for God is worked into something good.',
    'MIRROR': 'We are also aware that God causes all things to contribute to the advantage of those who love him; these are the ones who are called according to his predetermined purpose.'
  },

  'Hebreos 4:6': {
    // ESPAÑOL
    'RVR1960': 'Por lo tanto, puesto que falta que algunos entren en él, y aquellos a quienes primero fue anunciada la buena nueva no entraron por causa de desobediencia,',
    'RVC': 'Así que, puesto que falta que algunos entren en él, y aquellos a quienes primero se les anunció la buena nueva no entraron por causa de desobediencia,',
    'TLA': 'Entonces, unos sí van a descansar con Dios. Los israelitas que salieron de Egipto no lo lograron, porque desobedecieron a Dios.',
    'PDT': 'Algunos van a entrar en ese descanso de Dios. Los que primero oyeron las buenas noticias no entraron porque desobedecieron.',
    'NVI': 'Sin embargo, todavía falta que algunos entren en ese descanso, y los que anteriormente recibieron la buena noticia no entraron por causa de su desobediencia.',
    'NTV': 'Entonces, como la promesa de entrar en su descanso sigue vigente, algunos tienen que entrar. Y los que primero oyeron esta buena noticia no pudieron entrar a causa de su desobediencia.',
    'NBLA': 'Por tanto, puesto que todavía falta que algunos entren en él, y aquellos a quienes anteriormente se les anunció la buena nueva no entraron por causa de su desobediencia,',
    'VBL': 'Por tanto, puesto que falta que algunos entren en él, y aquellos a quienes primero fue anunciada la buena nueva no entraron por causa de desobediencia,',
    'BAEC': 'Por lo tanto, puesto que falta que algunos entren en él, y aquellos a quienes primero fue anunciada la buena nueva no entraron por causa de desobediencia [falta de fe y desconfianza],',
    
    // ENGLISH
    'ESV': 'Since therefore it remains for some to enter it, and those who formerly received the good news failed to enter because of disobedience,',
    'KJV': 'Seeing therefore it remaineth that some must enter therein, and they to whom it was first preached entered not in because of unbelief,',
    'TPT': 'So we see that they were not able to enter into their inheritance because they wrapped their hearts in unbelief.',
    'NLT': 'So God\'s rest is there for people to enter, but those who first heard this good news failed to enter because they disobeyed God.',
    'AMPC': 'Seeing then that the promise remains over [from past times] for some to enter that rest, and that those who formerly were given the good news about it and the opportunity, failed to appropriate it and did not enter because of disobedience,',
    'GNT': 'Those who first heard the Good News did not receive that rest, because they did not believe. There are, then, others who are allowed to receive it.',
    'MEV': 'Since therefore it remains that some must enter it, and those to whom it was first preached did not enter because of disobedience,',
    'MSG': 'So this promise has not yet been fulfilled. Those earlier ones never did get to the place of rest because they were disobedient.',
    'MIRROR': 'Since it remains for some to enter into this rest, and those who previously had the gospel preached to them did not enter because of unbelief,'
  },

  'Hebrews 4:6': {
    // ENGLISH
    'ESV': 'Since therefore it remains for some to enter it, and those who formerly received the good news failed to enter because of disobedience,',
    'KJV': 'Seeing therefore it remaineth that some must enter therein, and they to whom it was first preached entered not in because of unbelief,',
    'TPT': 'So we see that they were not able to enter into their inheritance because they wrapped their hearts in unbelief.',
    'NLT': 'So God\'s rest is there for people to enter, but those who first heard this good news failed to enter because they disobeyed God.',
    'AMPC': 'Seeing then that the promise remains over [from past times] for some to enter that rest, and that those who formerly were given the good news about it and the opportunity, failed to appropriate it and did not enter because of disobedience,',
    'GNT': 'Those who first heard the Good News did not receive that rest, because they did not believe. There are, then, others who are allowed to receive it.',
    'MEV': 'Since therefore it remains that some must enter it, and those to whom it was first preached did not enter because of disobedience,',
    'MSG': 'So this promise has not yet been fulfilled. Those earlier ones never did get to the place of rest because they were disobedient.',
    'MIRROR': 'Since it remains for some to enter into this rest, and those who previously had the gospel preached to them did not enter because of unbelief,'
  },

  '1 Thessalonians 5:23': {
    // ESPAÑOL
    'RVR1960': 'Y el mismo Dios de paz os santifique por completo; y todo vuestro ser, espíritu, alma y cuerpo, sea guardado irreprensible para la venida de nuestro Señor Jesucristo.',
    'RVC': 'Que el mismo Dios de paz los santifique por completo, y que todo su ser, espíritu, alma y cuerpo, sea guardado irreprensible para la venida de nuestro Señor Jesucristo.',
    'TLA': 'Pido a Dios, que es quien nos da la paz, que los haga completamente santos, y que los conserve sin culpa en todo: en el espíritu, en el alma y en el cuerpo, para cuando venga nuestro Señor Jesucristo.',
    'PDT': 'Que el Dios de paz los haga completamente santos. Que él los conserve perfectos en espíritu, alma y cuerpo para cuando venga nuestro Señor Jesucristo.',
    'NVI': 'Que Dios mismo, el Dios de paz, los santifique por completo, y conserve todo su ser —espíritu, alma y cuerpo— irreprochable para la venida de nuestro Señor Jesucristo.',
    'NTV': 'Ahora, que el Dios de paz los haga santos en todos los aspectos y que todo su espíritu, alma y cuerpo se mantenga sin culpa hasta que nuestro Señor Jesucristo venga otra vez.',
    'NBLA': 'Y que el mismo Dios de paz los santifique por completo; y que todo su ser, espíritu, alma y cuerpo, sea preservado irreprensible para la venida de nuestro Señor Jesucristo.',
    'VBL': 'Y el mismo Dios de paz os santifique por completo; y todo vuestro ser, espíritu, alma y cuerpo, sea guardado irreprensible para la venida de nuestro Señor Jesucristo.',
    'BAEC': 'Y el mismo Dios de paz os santifique por completo [os separe de las cosas profanas, os haga puros y os consagre totalmente a Dios]; y todo vuestro ser, espíritu, alma y cuerpo, sea guardado irreprensible para la venida de nuestro Señor Jesucristo.',
    
    // ENGLISH
    'ESV': 'Now may the God of peace himself sanctify you completely, and may your whole spirit and soul and body be kept blameless at the coming of our Lord Jesus Christ.',
    'KJV': 'And the very God of peace sanctify you wholly; and I pray God your whole spirit and soul and body be preserved blameless unto the coming of our Lord Jesus Christ.',
    'TPT': 'Now, may the God of peace and harmony set you apart, making you completely holy. And may your entire being—spirit, soul, and body—be kept completely flawless in the appearing of our Lord Jesus, the Anointed One.',
    'NLT': 'Now may the God of peace make you holy in every way, and may your whole spirit and soul and body be kept blameless until our Lord Jesus Christ comes again.',
    'AMPC': 'And may the God of peace Himself sanctify you through and through [separate you from profane things, make you pure and wholly consecrated to God]; and may your spirit and soul and body be preserved sound and complete [and found] blameless at the coming of our Lord Jesus Christ (the Messiah).',
    'GNT': 'May the God who gives us peace make you holy in every way and keep your whole being—spirit, soul, and body—free from every fault at the coming of our Lord Jesus Christ.',
    'MEV': 'Now may the God of peace Himself sanctify you completely. And may your whole spirit, soul, and body be preserved blameless unto the coming of our Lord Jesus Christ.',
    'MSG': 'May God himself, the God who makes everything holy and whole, make you holy and whole, put you together—spirit, soul, and body—and keep you fit for the coming of our Master, Jesus Christ.',
    'MIRROR': 'Now may the very God of peace personally set you apart completely whole, and may your spirit and soul and body be kept intact, blameless at the coming of our Lord Jesus Christ.'
  },

  'Filipenses 4:13': {
    // ESPAÑOL
    'RVR1960': 'Todo lo puedo en Cristo que me fortalece.',
    'RVC': 'Todo lo puedo en Cristo, que me fortalece.',
    'TLA': 'Cristo me da fuerzas para enfrentar toda situación.',
    'PDT': 'Por medio de Cristo, quien me da fuerzas, puedo enfrentarlo todo.',
    'NVI': 'Todo lo puedo en Cristo que me fortalece.',
    'NTV': 'Porque todo lo puedo hacer por medio de Cristo, quien me da las fuerzas.',
    'NBLA': 'Todo lo puedo en Cristo que me fortalece.',
    'VBL': 'Todo lo puedo en Cristo que me fortalece.',
    'BAEC': 'Todo lo puedo en Cristo que me fortalece [me infunde fuerzas interiores; estoy preparado para todo y puedo hacer frente a todo a través de Él, quien me infunde fuerzas interiores].',
    
    // ENGLISH
    'ESV': 'I can do all things through him who strengthens me.',
    'KJV': 'I can do all things through Christ which strengtheneth me.',
    'TPT': 'I can be content in any and every situation through the Anointed One who is my power and strength!',
    'NLT': 'For I can do everything through Christ, who gives me strength.',
    'AMPC': 'I have strength for all things in Christ Who empowers me [I am ready for anything and equal to anything through Him Who infuses inner strength into me; I am self-sufficient in Christ\'s sufficiency].',
    'GNT': 'I have the strength to face all conditions by the power that Christ gives me.',
    'MEV': 'I can do all things because of Christ who strengthens me.',
    'MSG': 'Whatever I have, wherever I am, I can make it through anything in the One who makes me who I am.',
    'MIRROR': 'I have strength for all things in Christ who constantly infuses me with power.'
  },

  'Philippians 4:13': {
    // ENGLISH
    'ESV': 'I can do all things through him who strengthens me.',
    'KJV': 'I can do all things through Christ which strengtheneth me.',
    'TPT': 'I can be content in any and every situation through the Anointed One who is my power and strength!',
    'NLT': 'For I can do everything through Christ, who gives me strength.',
    'AMPC': 'I have strength for all things in Christ Who empowers me [I am ready for anything and equal to anything through Him Who infuses inner strength into me; I am self-sufficient in Christ\'s sufficiency].',
    'GNT': 'I have the strength to face all conditions by the power that Christ gives me.',
    'MEV': 'I can do all things because of Christ who strengthens me.',
    'MSG': 'Whatever I have, wherever I am, I can make it through anything in the One who makes me who I am.',
    'MIRROR': 'I have strength for all things in Christ who constantly infuses me with power.'
  },

  'Jeremías 29:11': {
    // ESPAÑOL
    'RVR1960': 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.',
    'RVC': 'Yo sé muy bien los planes que tengo para ustedes —afirma el Señor—, planes de bienestar y no de calamidad, a fin de darles un futuro y una esperanza.',
    'TLA': 'Yo sé los planes que tengo para ustedes, planes para su bienestar y no para su mal, para darles un futuro lleno de esperanza. Yo, el Señor, lo afirmo.',
    'PDT': 'Yo sé los planes que tengo para ustedes. Son planes buenos, no para hacerles mal. Les voy a dar esperanza y un buen futuro.',
    'NVI': 'Porque yo sé muy bien los planes que tengo para ustedes —afirma el Señor—, planes de bienestar y no de calamidad, a fin de darles un futuro y una esperanza.',
    'NTV': 'Pues yo sé los planes que tengo para ustedes —dice el Señor—. Son planes para lo bueno y no para lo malo, para darles un futuro y una esperanza.',
    'NBLA': 'Porque Yo sé los planes que tengo para ustedes —declara el Señor— planes de bienestar y no de calamidad, para darles un futuro y una esperanza.',
    'VBL': 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.',
    'BAEC': 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis [y la esperanza de vuestro futuro].',
    
    // ENGLISH
    'ESV': 'For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.',
    'KJV': 'For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end.',
    'TPT': 'For I know the plans I have for you," says the Lord. "They are plans for good and not for disaster, to give you a future and a hope.',
    'NLT': 'For I know the plans I have for you," says the Lord. "They are plans for good and not for disaster, to give you a future and a hope.',
    'AMPC': 'For I know the thoughts and plans that I have for you, says the Lord, thoughts and plans for welfare and peace and not for evil, to give you hope in your final outcome.',
    'GNT': 'I alone know the plans I have for you, plans to bring you prosperity and not disaster, plans to bring about the future you hope for.',
    'MEV': 'For I know the plans that I have for you, says the Lord, plans for peace and not for evil, to give you a future and a hope.',
    'MSG': 'I know what I\'m doing. I have it all planned out—plans to take care of you, not abandon you, plans to give you the future you hope for.',
    'MIRROR': 'For I know the thoughts that I think toward you, says the Lord, thoughts of peace, and not of evil, to give you an expected end.'
  },

  'Génesis 39:2': {
    // ESPAÑOL
    'RVR1960': 'Mas Jehová estaba con José, y fue varón próspero; y estaba en casa de su amo el egipcio.',
    'RVC': 'Pero el Señor estaba con José, así que éste llegó a ser un hombre próspero, y vivía en casa de su amo egipcio.',
    'TLA': 'Pero yo, el Dios de Israel, siempre ayudé a José y le fue muy bien. José siguió viviendo en casa de su patrón egipcio.',
    'PDT': 'Pero el Señor estaba con José, y José prosperó. José vivía en la casa de su amo egipcio.',
    'NVI': 'Pero el Señor estaba con José y las cosas le salían bien. José vivía en la casa de su patrón egipcio.',
    'NTV': 'El Señor estaba con José, así que tuvo éxito en todo lo que hacía mientras servía en la casa de su amo egipcio.',
    'NBLA': 'Pero el SEÑOR estaba con José, y llegó a ser un hombre próspero, y estaba en casa de su amo egipcio.',
    'VBL': 'Pero Yahvé estaba con José, y fue un hombre próspero. Estaba en la casa de su amo egipcio.',
    'BAEC': 'Mas el Señor estaba con José, y fue varón próspero [que tenía éxito]; y estaba en casa de su amo egipcio.',
    
    // ENGLISH  
    'ESV': 'The Lord was with Joseph, and he became a successful man, and he was in the house of his Egyptian master.',
    'KJV': 'And the Lord was with Joseph, and he was a prosperous man; and he was in the house of his master the Egyptian.',
    'TPT': 'But the Lord\'s presence was with Joseph, and he became very successful while serving in the house of his Egyptian master.',
    'NLT': 'The Lord was with Joseph, so he succeeded in everything he did as he served in the home of his Egyptian master.',
    'AMPC': 'But the Lord was with Joseph, and he [though a slave] was a successful and prosperous man; and he was in the house of his master the Egyptian.',
    'GNT': 'The Lord was with Joseph and made him successful. He lived in the house of his Egyptian master,',
    'MEV': 'The Lord was with Joseph, and he was a prosperous man. He was in the house of his master the Egyptian.',
    'MSG': 'As it turned out, God was with Joseph and things went very well with him. He ended up living in the home of his Egyptian master.',
    'MIRROR': 'The Lord was with Joseph and he became a successful man; he was in the house of his master the Egyptian.'
  },

  'Genesis 39:2': {
    // ENGLISH
    'ESV': 'The Lord was with Joseph, and he became a successful man, and he was in the house of his Egyptian master.',
    'KJV': 'And the Lord was with Joseph, and he was a prosperous man; and he was in the house of his master the Egyptian.',
    'TPT': 'But the Lord\'s presence was with Joseph, and he became very successful while serving in the house of his Egyptian master.',
    'NLT': 'The Lord was with Joseph, so he succeeded in everything he did as he served in the home of his Egyptian master.',
    'AMPC': 'But the Lord was with Joseph, and he [though a slave] was a successful and prosperous man; and he was in the house of his master the Egyptian.',
    'GNT': 'The Lord was with Joseph and made him successful. He lived in the house of his Egyptian master,',
    'MEV': 'The Lord was with Joseph, and he was a prosperous man. He was in the house of his master the Egyptian.',
    'MSG': 'As it turned out, God was with Joseph and things went very well with him. He ended up living in the home of his Egyptian master.',
    'MIRROR': 'The Lord was with Joseph and he became a successful man; he was in the house of his master the Egyptian.'
  },

  'Isaías 55:11': {
    // ESPAÑOL
    'RVR1960': 'así será mi palabra que sale de mi boca; no volverá a mí vacía, sino que hará lo que yo quiero, y será prosperada en aquello para que la envié.',
    'RVC': 'Así es también la palabra que sale de mi boca: no volverá a mí vacía, sino que hará lo que yo quiero, y será prosperada en aquello para lo cual la envié.',
    'TLA': 'Lo mismo pasa con mi palabra. Cuando yo hablo, mis palabras no regresan a mí sin haber hecho nada. Al contrario, mis palabras hacen todo lo que yo quiero; siempre tienen éxito en lo que les ordeno hacer.',
    'PDT': 'Igualmente mi palabra, cuando sale de mi boca, no vuelve a mí vacía sino que hace lo que yo quiero y cumple el propósito para el cual la envié.',
    'NVI': 'Así es también la palabra que sale de mi boca: No volverá a mí vacía, sino que hará lo que yo deseo y cumplirá con mis propósitos.',
    'NTV': 'Lo mismo sucede con mi palabra. La envío y siempre produce fruto; logra todo lo que yo quiero y cumple los propósitos para los cuales la envié.',
    'NBLA': 'así será Mi palabra que sale de Mi boca, no volverá a Mí vacía sin haber realizado lo que deseo, y logrado el propósito para el cual la envié.',
    'VBL': 'así será mi palabra que sale de mi boca. No volverá a mí vacía, sino que hará lo que me place, y será prosperada en aquello para lo cual la envié.',
    'BAEC': 'así será Mi palabra que sale de Mi boca; no volverá a Mí vacía [sin producir efecto alguno, en vano], sino que hará lo que Yo deseo y cumplirá el propósito para el cual la envié.',
    
    // ENGLISH
    'ESV': 'so shall my word be that goes out from my mouth; it shall not return to me empty, but it shall accomplish that which I purpose, and shall succeed in the thing for which I sent it.',
    'KJV': 'So shall my word be that goeth forth out of my mouth: it shall not return unto me void, but it shall accomplish that which I please, and it shall prosper in the thing whereto I sent it.',
    'TPT': 'So it is when I speak. My word will not return to me unfulfilled and empty, but it will accomplish the beautiful plan I have given it.',
    'NLT': 'It is the same with my word. I send it out, and it always produces fruit. It will accomplish all I want it to, and it will prosper everywhere I send it.',
    'AMPC': 'So shall My word be that goes forth out of My mouth: it shall not return to Me void [without producing any effect, useless], but it shall accomplish that which I please and purpose, and it shall prosper in the thing for which I sent it.',
    'GNT': 'That is how it is with the word that I speak—it will not fail to do what I plan for it; it will do everything I send it to do.',
    'MEV': 'so shall My word be that goes forth from My mouth; it shall not return to Me void, but it shall accomplish that which I please, and it shall prosper in the thing for which I sent it.',
    'MSG': 'That\'s how it is with my words. They don\'t return to me without doing everything I send them to do.',
    'MIRROR': 'So shall My word be that goes forth from My mouth; it shall not return to Me void and without producing any effect, useless, but it shall accomplish that which I please and purpose, and it shall prosper in the thing for which I sent it.'
  },

  'Isaiah 55:11': {
    // ENGLISH
    'ESV': 'so shall my word be that goes out from my mouth; it shall not return to me empty, but it shall accomplish that which I purpose, and shall succeed in the thing for which I sent it.',
    'KJV': 'So shall my word be that goeth forth out of my mouth: it shall not return unto me void, but it shall accomplish that which I please, and it shall prosper in the thing whereto I sent it.',
    'TPT': 'So it is when I speak. My word will not return to me unfulfilled and empty, but it will accomplish the beautiful plan I have given it.',
    'NLT': 'It is the same with my word. I send it out, and it always produces fruit. It will accomplish all I want it to, and it will prosper everywhere I send it.',
    'AMPC': 'So shall My word be that goes forth out of My mouth: it shall not return to Me void [without producing any effect, useless], but it shall accomplish that which I please and purpose, and it shall prosper in the thing for which I sent it.',
    'GNT': 'That is how it is with the word that I speak—it will not fail to do what I plan for it; it will do everything I send it to do.',
    'MEV': 'so shall My word be that goes forth from My mouth; it shall not return to Me void, but it shall accomplish that which I please, and it shall prosper in the thing for which I sent it.',
    'MSG': 'That\'s how it is with my words. They don\'t return to me without doing everything I send them to do.',
    'MIRROR': 'So shall My word be that goes forth from My mouth; it shall not return to Me void and without producing any effect, useless, but it shall accomplish that which I please and purpose, and it shall prosper in the thing for which I sent it.'
  },

  'Jeremiah 29:11': {
    // ENGLISH
    'ESV': 'For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.',
    'KJV': 'For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end.',
    'TPT': 'For I know the plans I have for you," says the Lord. "They are plans for good and not for disaster, to give you a future and a hope.',
    'NLT': 'For I know the plans I have for you," says the Lord. "They are plans for good and not for disaster, to give you a future and a hope.',
    'AMPC': 'For I know the thoughts and plans that I have for you, says the Lord, thoughts and plans for welfare and peace and not for evil, to give you hope in your final outcome.',
    'GNT': 'I alone know the plans I have for you, plans to bring you prosperity and not disaster, plans to bring about the future you hope for.',
    'MEV': 'For I know the plans that I have for you, says the Lord, plans for peace and not for evil, to give you a future and a hope.',
    'MSG': 'I know what I\'m doing. I have it all planned out—plans to take care of you, not abandon you, plans to give you the future you hope for.',
    'MIRROR': 'For I know the thoughts that I think toward you, says the Lord, thoughts of peace, and not of evil, to give you an expected end.'
  }
}

// Utility functions for verse management
export function normalizeReference(reference: string): string {
  return reference
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/\s+/g, ' ')
    .replace(/(\d+)\s*([a-z])/g, '$1 $2')
    .replace(/(\w+)\s*(\d+):(\d+)/g, '$1 $2:$3')
    .trim()
}

export function findBestMatch(input: string): string | null {
  const normalized = normalizeReference(input)
  
  // Direct matches first
  for (const key of Object.keys(ENHANCED_BIBLE_DATA)) {
    if (normalizeReference(key) === normalized) {
      return key
    }
  }
  
  // Partial matches
  for (const key of Object.keys(ENHANCED_BIBLE_DATA)) {
    if (normalizeReference(key).includes(normalized) || normalized.includes(normalizeReference(key))) {
      return key
    }
  }
  
  return null
}

export function getAvailableVerses(): string[] {
  return Object.keys(ENHANCED_BIBLE_DATA)
}

export function getVerseTranslations(reference: string): { [version: string]: string } | null {
  const bestMatch = findBestMatch(reference)
  return bestMatch ? ENHANCED_BIBLE_DATA[bestMatch] : null
}
